'use strict';
define(['app', 'lodash', 'js/extended-route-provider', 'services/app-config-service', 'scbd-angularjs-filters'], function (app, _) {
         
    app.provider("realm", {

        $get : ["$location", 'appConfigService', function($location, appConfigService) {
            return { value : appConfigService.currentRealm || 'ABS' };
        }]
    });
    app.config(['extendedRouteProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        
        $routeProvider.
               when('/',                { templateUrl: 'views/home/index.html', label:'ABSCH', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               
               when('/projects',         { templateUrl: 'views/projects/index.html', label:'Projects', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               
               when('/articles',         { templateUrl: 'views/article/index.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               when('/articles/new',      { templateUrl: 'views/article/editor.html', label:'Article Editor', isNew:true, resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               when('/articles/:id/:title?/edit', { templateUrl: 'views/article/editor.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               when('/articles/:id/:title?',     { templateUrl: 'views/article/view.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
              
               when('/manage/:schema',          { templateUrl: 'views/tags/index.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).               
               when('/signin',          { templateUrl: 'views/shared/login.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).               
               
               
               otherwise({templateUrl: 'views/shared/404.html', label:'404 Error'});

    }]);


    function securize(roleList, useNationalRoles, checkEmailVerified)
    {
        return ["$location", "authentication", "appConfigService", "$filter", "$route",
         function ($location, authentication, appConfigService, $filter, $route) {

            return authentication.getUser().then(function (user) {
                
                if(checkEmailVerified && user.isAuthenticated && !user.isEmailVerified){
                    $location.path(appConfigService.getSiteMapUrls().user.verifyEmail);
                }

                var roles = _.clone(roleList||[]);

                if (roles && !_.isEmpty(roles)) {
                    roles = _.map(roles, appConfigService.getRoleName);
                }
                if(useNationalRoles){
                    var path = $location.$$url.replace('/register/','');
                    var schema;

                    if(path.indexOf('/')>0)
                        schema = path.substr(0, path.indexOf('/'));
                    else
                        schema = path;

                    var schemaName = $filter('mapSchema')(schema);
                    if(!_.contains(appConfigService.referenceSchemas, schemaName))
                        roles = (roles || []).concat(appConfigService.nationalRoles());
                }
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

});
