import app from '~/app'
import ng from 'angular'
import $ from 'jquery'
import _ from 'lodash'

    var accountsBaseUrl = window.scbd.accountsUrl;

	app.factory('apiToken', ["$q", "$rootScope", "$window", "$document", "$timeout", function($q, $rootScope, $window, $document, $timeout) {

		var authenticationFrameQ = $q(function(resolve, reject){

			var frame = $('<iframe src="'+accountsBaseUrl+'/app/authorize.html'+'" style="display:none"></iframe>');

			$("body").prepend(frame);
			let frameLoaded = false;

			frame.on("load", function(evt){
				resolve(evt.target || evt.srcElement);
				frameLoaded = true
			});

			$timeout(function(){
				if(!frameLoaded)
					reject('accounts is not available / call is made from an unauthorized domain');
			}, 5000);
		});

		var pToken;

		//============================================================
		//
		//
		//============================================================
		function getToken() {

			return $q.when(authenticationFrameQ).then(function(authenticationFrame){

				if(!authenticationFrame) {
					pToken = pToken || null;
				}

				if(pToken!==undefined) {
					return $q.when(pToken || null).then(checkTokenExpiration);
				}

				pToken = null;

				var defer = $q.defer();
				var unauthorizedTimeout = $timeout(function(){
					console.error('accounts is not available / call is made from an unauthorized domain');
					defer.resolve(null);
				}, 1000);

				var receiveMessage = function(event)
				{
					$timeout.cancel(unauthorizedTimeout);

					if(event.origin!=accountsBaseUrl)
						return;

					var message = JSON.parse(event.data);

					if(message.type=='authenticationToken') {
						defer.resolve({ token : message.authenticationToken, expiration : message.expiration });

						if(message.authenticationEmail)
							$rootScope.lastLoginEmail = message.authenticationEmail;
					}
					else {
						defer.reject('unsupported message type');
					}
				};

				$window.addEventListener('message', receiveMessage);

				pToken = defer.promise.then(function(t){

					pToken = t;

					if(Vue?.prototype.$auth)
						Vue.prototype.$auth.setUserToken(pToken.token);

					return t;

				}).finally(function(){

					$window.removeEventListener('message', receiveMessage);

				});

				authenticationFrame.contentWindow.postMessage(JSON.stringify({ type : 'getAuthenticationToken' }), accountsBaseUrl);

				return pToken;

			}).catch(function(error){

				pToken = null;

				console.error(error);

				throw error;

			});
		}

		//============================================================
	    //
	    //
	    //============================================================
		function setToken(token, email, expiration) { // remoteUpdate:=true
            

			return $q.when(authenticationFrameQ).then(function(authenticationFrame){

				if(token){
					pToken = {
								token       : token,
								expiration  : expiration
							}
				}
				else
					pToken = undefined;

				if(authenticationFrame) {

					var msg = {
						type : "setAuthenticationToken",
						authenticationToken : token,
						authenticationEmail : email,
						expiration        : expiration
					};

					if(Vue?.prototype.$auth)
						Vue.prototype.$auth.setUserToken(token);

					authenticationFrame.contentWindow.postMessage(JSON.stringify(msg), accountsBaseUrl);
				}

				if(email) {
					$rootScope.lastLoginEmail = email;
				}
			});
		}

        function checkTokenExpiration(authenticationToken){
            
            if(authenticationToken && authenticationToken.expiration){
                if(new Date(authenticationToken.expiration).getTime() < new Date().getTime()){
                    pToken = null;
                    $rootScope.$broadcast('event:auth-sessionExpired');
                }
            }

            return authenticationToken;
        }

		return {
			get : getToken,
			set : setToken
		};
	}]);


	app.factory('authentication', ["$http", "$rootScope", "$q", "apiToken", function($http, $rootScope, $q, apiToken) {

		var currentUser = null;

		//============================================================
	    //
	    //
	    //============================================================
		function anonymous() {
			return { userID: 1, name: 'anonymous', email: 'anonymous@domain', government: null, userGroups: null, isAuthenticated: false, isOffline: true, roles: [] };
		}

		//============================================================
	    //
	    //
	    //============================================================
		function getUser() {

			if(currentUser)
				return $q.when(currentUser);

			return $q.when(apiToken.get()).then(function(apiUserToken) {

				if(!apiUserToken) {
					return anonymous();
				}

				return $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + apiUserToken.token } }).then(function(r){
					return r.data;
				});

			}).catch(function() {

				return anonymous();

			}).then(function(user){

				setUser(user);

				return user;
			});
		}

		//==============================
		//
		//==============================
		function LEGACY_user() {

		    console.warn("authentication.user() is DEPRECATED. Use: getUser()");

			return $rootScope.user;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signIn(email, password) {

			return $http.post("/api/v2013/authentication/token", {

				"email": email,
				"password": password

			}).then(function(res) {

				var token  = res.data;

				return $q.all([token, $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + token.authenticationToken } })]);

			}).then(function(res) {

				var token = res[0];
				var user  = res[1].data;

				email = (email||"").toLowerCase();

				apiToken.set(token.authenticationToken, email);
				setUser (user);

				$rootScope.$broadcast('signIn', user);

				return user;

			}).catch(function(error) {

				throw { error:error.data, errorCode : error.status };

			});
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signOut () {

			apiToken.set(null);

			setUser(null);

			return $q.when(getUser()).then(function(user) {

				$rootScope.$broadcast('signOut', user);

				return user;
			});
		}

		//============================================================
	    //
	    //
	    //============================================================
		function setUser(user) {

			currentUser     = user || undefined;
			$rootScope.user = user || anonymous();

			if(Vue?.prototype.$auth)
				Vue.prototype.$auth.setUser($rootScope.user);

            if (user && user.isAuthenticated && !user.isEmailVerified) {
                $rootScope.$broadcast('event:auth-emailVerification', {
                    message: 'Email verification pending. Please verify you email before submitting any data.'
                });
            }
		}

		//============================================================
	    //
	    //
	    //============================================================
		function isInRole(user, roles) {

			if(!user)  return false;
			if(!roles) return false;

			if( _.isString(roles)) roles = [roles];
			if(!_.isArray (roles)) throw new Error("`roles` must be string or array od string");

			return !!_.intersection(user.roles||[], roles).length;
		}

        //============================================================
        //
        //
        //============================================================
        function isEmailVerified() {
            
            return $q.when(getUser()).then(function(user) {

               return (user && user.isAuthenticated && user.isEmailVerified) ;
               
            });

        }

        var sessionExpiredAlert = false
        $rootScope.$on('event:auth-sessionExpired', function(){
            
            if(!sessionExpiredAlert){
                sessionExpiredAlert = true;
                alert('your session has expired');                
            }
            signOut();
        });

		return {
			getUser  : getUser,
			signIn   : signIn,
			signOut  : signOut,
			isInRole : isInRole,
            isEmailVerified:isEmailVerified,
            accountsBaseUrl : function() { return accountsBaseUrl; }
		};

	}]);

    app.factory('authenticationHttpIntercepter', ["$q", "apiToken", "$rootScope",
     function($q, apiToken, $rootScope) {

        return {
            request: function(config) {
                
				var trusted =   /^https:\/\/api.cbd.int\//i.test(config.url) ||
                                /^https:\/\/api.cbddev.xyz\//i.test(config.url)||
								/^\/(api|translation-api)\//i                .test(config.url) ||								
                                /^http:\/\/localhost[:\/]/i.test(config.url);

                var hasAuthorization = (config.headers || {}).hasOwnProperty('Authorization') ||
                    (config.headers || {}).hasOwnProperty('authorization');

                if (!trusted || hasAuthorization) // no need to alter config
                    return config;

                //Add token to http headers

                return $q.when(apiToken.get()).then(function(authenticationToken) {
                    
                    if (authenticationToken) {
                        config.headers = angular.extend(config.headers || {}, {
                            Authorization: "Ticket " + authenticationToken.token
                        });
                    }

                    return config;
                });
            },
            responseError: function(rejection) {

                if (rejection.data && rejection.data.statusCode == 401) {

                    if (rejection.data && rejection.data.message && rejection.data.message.indexOf('Email verification pending') >= 0) {
                        $rootScope.$broadcast('event:auth-emailVerification', rejection.data);
                    }

                }
                // otherwise, default behavior
                return $q.reject(rejection);
            }
        };
    }]);

    app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
    }]);