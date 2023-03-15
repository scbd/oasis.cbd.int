import app from '~/app';
import '~/components/scbd-angularjs-services/main';

export { default as template } from './login.html';
	export default ["$scope", "$location", "authentication", '$rootScope', function ($scope, $location, authentication, $rootScope) {

		$scope.email = null;
		$scope.password = null;

		//============================================================
		//
		//
		//============================================================
		$scope.signIn = function () {

			$scope.errorInvalid = false;
			$scope.errorTimeout = false;
			$scope.waiting = true;
			authentication.signIn($scope.email, $scope.password)				
				.catch(function onerror(error) {
					$scope.password = "";
					$scope.errorInvalid = error.errorCode == 403;
					$scope.errorTimeout = error.errorCode != 403;
				})
				.finally(function () {
					$scope.waiting = false;
				});
		};

		$scope.actionSignup = function () {
			var redirect_uri = encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/');
			$window.location.href = 'https://accounts.cbd.int/signup?redirect_uri=' + redirect_uri;
		};

		// $rootScope.$on('event:auth-sessionExpired', function (evt, data) {

		// 	$scope.user = undefined;
		// 	$scope.sessionExpiredAlert = true;
		// 	$('#loginDialog').modal({
		// 		backdrop: "static",
		// 		keyboard: false
		// 	});
		// })

		const signInEvent = $scope.$on('signIn', function(evt, data){
			redirectUser();
		});
		authentication.getUser().then(function(user){
			if(user.isAuthenticated)
				redirectUser();
		})

		function redirectUser(){
			console.log($location.search())
			if ($location.search().returnUrl)
				$location.url($location.search().returnUrl);
			else
				$location.url('/');
		}

	}];

