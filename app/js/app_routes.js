
import app from '~/app';
import _ from 'lodash';
import '~/services/app-config-service';
import '~/components/scbd-angularjs-services/main';

import { securize, mapView, importQ, injectRouteParams } from './mixin';
import * as angularViewWrapper from '~/views/shared/angular-view-wrapper'

var baseUrl = require.toUrl("").replace(/\?v=.*$/, "");

function logError(err) {
  console.log(err)
  throw err;
}

const routeTemplates = {

    views_home_index          : { component: ()=>import('~/views/home/index').catch(logError) },
    views_projects_index      : { component: ()=>import('~/views/projects/index').catch(logError) },
    views_translation_index   : { component: ()=>import('~/views/translation/index').catch(logError) },
    views_translation_project : { component: ()=>import('~/views/translation/project').catch(logError) },
    views_translation_database: { component: ()=>import('~/views/translation/database-tables').catch(logError) },
    views_translation_table   : { component: ()=>import('~/views/translation/table').catch(logError) },
    views_article_index       : { component: ()=>import('~/views/article/index').catch(logError) },
    views_article_editor      : { component: ()=>import('~/views/article/editor').catch(logError) },
    views_article_view        : { component: ()=>import('~/views/article/view').catch(logError) },
    views_workflows_index     : { component: ()=>import('~/views/workflows/index').catch(logError) },
    views_widgets_index       : { component: ()=>import('~/views/widgets/index').catch(logError) },
    views_widgets_edit        : { component: ()=>import('~/views/widgets/edit').catch(logError) },
    views_widgets_view        : { component: ()=>import('~/views/widgets/view').catch(logError) },
    views_tags_index          : { component: ()=>import('~/views/tags/index').catch(logError) },
    views_shared_login        : { component: ()=>import('~/views/shared/login').catch(logError) },
};

app.config(["$routeProvider", '$locationProvider', function ($routeProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix("!");
  
    $routeProvider.
        when('/',                                       { ...mapView(angularViewWrapper), label:'OASIS',              resolveUser : true, resolve : { ...routeTemplates.views_home_index           , securized : securize(null,null, true) }}).
        when('/projects',                               { ...mapView(angularViewWrapper), label:'Projects',           resolveUser : true, resolve : { ...routeTemplates.views_projects_index       , securized : securize(null,null, true) }}).
        when('/translation',                            { ...mapView(angularViewWrapper), label:'Translation',        resolveUser : true, resolve : { ...routeTemplates.views_translation_index    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/project/:repository',        { ...mapView(angularViewWrapper), label:'Projects',           resolveUser : true, resolve : { ...routeTemplates.views_translation_project  , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/database-tables',            { ...mapView(angularViewWrapper), label:'Translation',        resolveUser : true, resolve : { ...routeTemplates.views_translation_database , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/database-tables/:table',     { ...mapView(angularViewWrapper), label:'Translation',        resolveUser : true, resolve : { ...routeTemplates.views_translation_table    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/articles',                               { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_index        , securized : securize(null,null, true) }, reloadOnSearch:false}).
        when('/articles/new',                           { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        when('/articles/:id/:title?/edit',              { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/articles/:id/:title?',                   { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_view         , securized : securize(null,null, true) }}).
        when('/workflows',                              { ...mapView(angularViewWrapper), label:'Workflow Manager',   resolveUser : true, resolve : { ...routeTemplates.views_workflows_index      , securized : securize(['Administrator', 'oasisWorkflowManager'], null, true) }}).
        when('/widgets',                                { ...mapView(angularViewWrapper), label:'Widgets',            resolveUser : true, resolve : { ...routeTemplates.views_widgets_index        , securized : securize(null,null, true) }}).
        when('/widgets/new',                            { ...mapView(angularViewWrapper), label:'New',                resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        when('/widgets/:id/edit',                       { ...mapView(angularViewWrapper), label:'Edit',               resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/widgets/:id/view?',                      { ...mapView(angularViewWrapper), label:'Preview',            resolveUser : true, resolve : { ...routeTemplates.views_widgets_view         , securized : securize(null,null, true) }}).
        when('/manage/:schema',                         { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_tags_index           , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/signin',                                 { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_shared_login         , securized : securize(null,null, true) }}).
    
        otherwise({templateUrl: 'views/shared/404.html', label:'404 Error'});

}])
         
app.provider("realm", {

    $get : ["$location", 'appConfigService', function($location, appConfigService) {
        return { value : appConfigService.currentRealm || 'ABS' };
    }]
});