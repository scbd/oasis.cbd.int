
import app from 'app';
import _ from 'lodash';
// import 'js/extended-route-provider';
import 'services/app-config-service';
import 'scbd-angularjs-filters';

import { securize, resolveLiteral, mapView, currentUser, importQ, injectRouteParams } from './mixin';
import * as angularViewWrapper from '~/views/shared/angular-view-wrapper'


const routeTemplates = {

    views_home_index          : { component: ()=>import('~/views/home/index') },
    views_projects_index      : { component: ()=>import('~/views/projects/index') },
    views_translation_index   : { component: ()=>import('~/views/translation/index') },
    views_translation_project : { component: ()=>import('~/views/translation/project') },
    views_translation_database: { component: ()=>import('~/views/translation/database-tables') },
    views_translation_table   : { component: ()=>import('~/views/translation/table') },
    views_article_index       : { component: ()=>import('~/views/article/index') },
    views_article_editor      : { component: ()=>import('~/views/article/editor') },
    views_article_view        : { component: ()=>import('~/views/article/view') },
    views_workflows_index     : { component: ()=>import('~/views/workflows/index') },
    views_widgets_index       : { component: ()=>import('~/views/widgets/index') },
    views_widgets_edit        : { component: ()=>import('~/views/widgets/edit') },
    views_widgets_view        : { component: ()=>import('~/views/widgets/view') },
    views_tags_index          : { component: ()=>import('~/views/tags/index') },
    views_shared_login        : { component: ()=>import('~/views/shared/login') },
};

app.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.
       
        when('/',                                       { ...mapView(angularViewWrapper), label:'OASIS',              resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_home_index           , securized : securize(null,null, true) }}).
        when('/projects',                               { ...mapView(angularViewWrapper), label:'Projects',           resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_projects_index       , securized : securize(null,null, true) }}).
        when('/translation',                            { ...mapView(angularViewWrapper), label:'Translation',        resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_index    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/project/:repository',        { ...mapView(angularViewWrapper), label:'Projects',           resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_project  , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/database-tables',            { ...mapView(angularViewWrapper), label:'Translation',        resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_database , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/database-tables/:table',     { ...mapView(angularViewWrapper), label:'Translation',        resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_table    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/articles',                               { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_index        , securized : securize(null,null, true) }, reloadOnSearch:false}).
        when('/articles/new',                           { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        when('/articles/:id/:title?/edit',              { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/articles/:id/:title?',                   { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_view         , securized : securize(null,null, true) }}).
        when('/workflows',                              { ...mapView(angularViewWrapper), label:'Workflow Manager',   resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_workflows_index      , securized : securize(['Administrator', 'oasisWorkflowManager'], null, true) }}).
        when('/widgets',                                { ...mapView(angularViewWrapper), label:'Widgets',            resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_index        , securized : securize(null,null, true) }}).
        when('/widgets/new',                            { ...mapView(angularViewWrapper), label:'New',                resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        when('/widgets/:id/edit',                       { ...mapView(angularViewWrapper), label:'Edit',               resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/widgets/:id/view?',                      { ...mapView(angularViewWrapper), label:'Preview',            resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_view         , securized : securize(null,null, true) }}).
        when('/manage/:schema',                         { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_tags_index           , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/signin',                                 { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_shared_login         , securized : securize(null,null, true) }}).
    
        otherwise({templateUrl: 'views/shared/404.html', label:'404 Error'});

}])
         
app.provider("realm", {

    $get : ["$location", 'appConfigService', function($location, appConfigService) {
        return { value : appConfigService.currentRealm || 'ABS' };
    }]
});
    // app.config(['extendedRouteProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    //     $locationProvider.html5Mode(true);
    //     $locationProvider.hashPrefix('!');
        
    //     $routeProvider.
    //            when('/',                { templateUrl: 'views/home/index.html', label:'OASIS', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               
    //            when('/projects',                    { templateUrl: 'views/projects/index.html', label:'Projects', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //            when('/translation',                         { templateUrl: 'views/translation/index.html', label:'Translation', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //            when('/translation/project/:repository',     { templateUrl: 'views/translation/project.html', label:'Projects', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //            when('/translation/database-tables',         { templateUrl: 'views/translation/database-tables.html', label:'Translation', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //            when('/translation/database-tables/:table',  { templateUrl: 'views/translation/table.html', label:'Translation', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
               
    //            when('/articles',                    { templateUrl: 'views/article/index.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }, reloadOnSearch:false}).
    //            when('/articles/new',                { templateUrl: 'views/article/editor.html', label:'Article Editor', isNew:true, resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //            when('/articles/:id/:title?/edit',   { templateUrl: 'views/article/editor.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //            when('/articles/:id/:title?',        { templateUrl: 'views/article/view.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               
    //            when('/workflows',                   { templateUrl: 'views/workflows/index.html', label:'Workflow Manager', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisWorkflowManager'], null, true) }}).
               
    //            when('/widgets',                    { templateUrl: 'views/widgets/index.html' , label:'Widgets', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //            when('/widgets/new',                { templateUrl: 'views/widgets/edit.html'  , label:'New',     resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
    //            when('/widgets/:id/edit',           { templateUrl: 'views/widgets/edit.html'  , label:'Edit',    resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //            when('/widgets/:id/view?',          { templateUrl: 'views/widgets/view.html',   label:'Preview', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
                             
    //            when('/manage/:schema',              { templateUrl: 'views/tags/index.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).               
    //            when('/signin',                      { templateUrl: 'views/shared/login.html', label:'Article Editor', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).               
               
               
    //            otherwise({templateUrl: 'views/shared/404.html', label:'404 Error'});

    // }]);

    // app.config(['extendedRouteProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    //     $locationProvider.html5Mode(true);
    //     $locationProvider.hashPrefix('!');
        
    //     $routeProvider.
               
    //         when('/',                                       { templateUrl: 'views/home/index.html',                 label:'OASIS',              resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //         when('/projects',                               { templateUrl: 'views/projects/index.html',             label:'Projects',           resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //         when('/translation',                            { templateUrl: 'views/translation/index.html',          label:'Translation',        resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/translation/project/:repository',        { templateUrl: 'views/translation/project.html',        label:'Projects',           resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/translation/database-tables',            { templateUrl: 'views/translation/database-tables.html',label:'Translation',        resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/translation/database-tables/:table',     { templateUrl: 'views/translation/table.html',          label:'Translation',        resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/articles',                               { templateUrl: 'views/article/index.html',              label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }, reloadOnSearch:false}).
    //         when('/articles/new',                           { templateUrl: 'views/article/editor.html',             label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
    //         when('/articles/:id/:title?/edit',              { templateUrl: 'views/article/editor.html',             label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/articles/:id/:title?',                   { templateUrl: 'views/article/view.html',               label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //         when('/workflows',                              { templateUrl: 'views/workflows/index.html',            label:'Workflow Manager',   resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisWorkflowManager'], null, true) }}).
    //         when('/widgets',                                { templateUrl: 'views/widgets/index.html' ,             label:'Widgets',            resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //         when('/widgets/new',                            { templateUrl: 'views/widgets/edit.html'  ,             label:'New',                resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
    //         when('/widgets/:id/edit',                       { templateUrl: 'views/widgets/edit.html'  ,             label:'Edit',               resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/widgets/:id/view?',                      { templateUrl: 'views/widgets/view.html',               label:'Preview',            resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //         when('/manage/:schema',                         { templateUrl: 'views/tags/index.html',                 label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
    //         when('/signin',                                 { templateUrl: 'views/shared/login.html',               label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).

    //         when('/',                { templateUrl: 'views/home/index.html', label:'OASIS', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
    //         when('/projects',        { templateUrl: 'views/projects/index.html', label:'Projects', resolveController: true, resolveUser : true, resolve : { securized : securize(null,null, true) }}).
               
               
    //            otherwise({templateUrl: 'views/shared/404.html', label:'404 Error'});

    // }]);


// function securize(roleList, useNationalRoles, checkEmailVerified)
// {
//     return ["$location", "authentication", "appConfigService", "$filter", "$route",
//         function ($location, authentication, appConfigService, $filter, $route) {

//         return authentication.getUser().then(function (user) {
            
//             if(checkEmailVerified && user.isAuthenticated && !user.isEmailVerified){
//                 $location.path(appConfigService.getSiteMapUrls().user.verifyEmail);
//             }

//             var roles = _.clone(roleList||[]);

//             if (!user.isAuthenticated) {

//                 console.log("securize: force sign in");

//                 if (!$location.search().returnUrl)
//                     $location.search({ returnUrl: $location.url() });

//                 $location.path(appConfigService.getSiteMapUrls().user.signIn);

//             }
//             else if (roles && !_.isEmpty(roles) && _.isEmpty(_.intersection(roles, user.roles))){

//                 console.log("securize: not authorized");

//                 $location.search({ path: $location.url() });
//                 $location.path(appConfigService.getSiteMapUrls().errors.notAuthorized);
//             }

//             return user;
//         });
//     }];
// }


