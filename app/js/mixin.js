import app from '~/app';
import 'jquery'
import 'angular-route'
import '~/components/scbd-angularjs-services/main'
// import 'ngDialog'
import 'angular-cookies'
import _ from 'lodash'
import { CreateAngularVuePlainPlugin, AngularVueRoutePlugin, AngularVueRouterPlugin } from 'angular-vue-plugins';

//============================================================
//
//============================================================
export function mapView(comp) {

    const template   = comp.template;
    const controller = comp.default;

    return { template, controller }
}
//============================================================
//
//============================================================
export function resolveLiteral(value) {
    return function () { return value; };
}

export function importQ(module) {
    var importFn = function ($q) {
      return $q(function (resolve, reject) {
        require([module], resolve, function (e) {
          console.error(e);
          reject(e);
        });
      });
    };
    importFn.$inject = ["$q"];
    return importFn;
}

//============================================================
//
//============================================================
export function injectRouteParams(params) {
  return ["$route", function ($route) {
    return _.defaults($route.current.params, params);
  }];
}

export function currentUser() {
  return ["$q", "authentication", function ($q, authentication) {
    return $q.when(authentication.getUser());
  }];
}

export function securize(roleList, useNationalRoles, checkEmailVerified){
    return ["$location", "authentication", "appConfigService", "$filter", "$route",
     function ($location, authentication, appConfigService, $filter, $route) {

        return authentication.getUser().then(function (user) {
            
            if(checkEmailVerified && user.isAuthenticated && !user.isEmailVerified){
                $location.path(appConfigService.getSiteMapUrls().user.verifyEmail);
            }

            var roles = _.clone(roleList||[]);

            if (!user.isAuthenticated) {

                console.log("securize: force sign in");

                if (!$location.search().returnUrl)
                    $location.search({ returnUrl: $location.url() });

                $location.path(appConfigService.getSiteMapUrls().user.signIn);

            }
            else if (roles && !_.isEmpty(roles) && _.isEmpty(_.intersection(roles, user.roles))){

                console.log("securize: not authorized");

                $location.search({ path: $location.url() });
                $location.path(appConfigService.getSiteMapUrls().errors.notAuthorized);
            }

            return user;
        });
    }];
}


app.run(["locale", '$injector', 'authentication', function (locale, $injector, authentication) {

  registerVuePlugin('$locale', locale);
  registerVuePlugin('$accountsBaseUrl', authentication.accountsBaseUrl())

  window.Vue.use(new AngularVueRoutePlugin ($injector));
  window.Vue.use(new AngularVueRouterPlugin($injector));
  window.Vue.use(AngularVueAuthPlugin($injector));
    
}]);
  
function registerVuePlugin(name, service){
  const newPlugin = new CreateAngularVuePlainPlugin(name, service)
  window.Vue.use(newPlugin);
}
export const AngularVueAuthPlugin = ($injector) =>{

  if(!$injector)
      throw new Error('Angular $injector not provided, cannot use AngularVueRoutePlugin plugin');

  let user;
  let userToken;

  const auth ={
      get user()          { return user; },
      get loggedIn()      { return user && user.isAuthenticated },
      setUser(newUser)    { user = newUser },
      setUserToken(token) { userToken = token; },

      logout()        { 
          const authentication = $injector.get('authentication');
          return authentication.signOut();
      },
      fetchUser()     { 
          const authentication = $injector.get('authentication');
          return authentication.getUser();
      },
      hasScope(scopeName)      { 

          let rolesToValidate = [];
          if(typeof scopeName == 'string')
              rolesToValidate = [scopeName];
          else if(!Array.isArray(scopeName))
              throw new Error("`scopeName` must be string or array od string");

          rolesToValidate = scopeName;

          const hasRole = rolesToValidate.find(scope=>user?.roles.includes(scope));

          return !!hasRole;
      },
      refreshTokens() { throw new Error('Not Implemented'); },
      onError()       { throw new Error('Not Implemented'); },
      onRedirect()    { throw new Error('Not Implemented'); },
      strategy :      { 
          token : { 
              get()      { return userToken; },
              set(token) { userToken = token }                
          },
          get refreshToken() { throw new Error('Not Implemented');  }            
       },
  }

  return {
      install(Vue, options) {
          if(!Vue.prototype.$auth)
              Vue.prototype.$auth = auth;
      }
    }
};