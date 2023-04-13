import app from '~/app';
import 'jquery'
import 'angular-route'
import '~/components/scbd-angularjs-services/main'
// import 'ngDialog'
import 'angular-cookies'
import _ from 'lodash'

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

