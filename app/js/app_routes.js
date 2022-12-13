
import app from '~/app';
import _ from 'lodash';
import '~/services/app-config-service';
import '~/components/scbd-angularjs-services/main';

import { securize, mapView, importQ, injectRouteParams } from './mixin';
import * as angularViewWrapper from '~/views/shared/angular-view-wrapper'

var baseUrl = require.toUrl("").replace(/\?v=.*$/, "");


const routeTemplates = {

    views_home_index          : { component: ()=>import('~/views/home/index') },
    views_projects_index      : { component: ()=>import('~/views/projects/index') },
    views_translation_index   : { component: ()=>import('~/views/translation/index') },
    views_translation_project : { component: ()=>import('~/views/translation/project') },
    views_translation_database: { component: ()=>import('~/views/translation/database-tables') },
    views_translation_table   : { component: ()=>import('~/views/translation/table') },
    views_article_index       : { component: ()=>import('~/views/article/index') },
    // views_article_editor      : { component: ()=>import('~/views/article/editor') },
    views_article_view        : { component: ()=>import('~/views/article/view') },
    views_workflows_index     : { component: ()=>import('~/views/workflows/index') },
    views_widgets_index       : { component: ()=>import('~/views/widgets/index') },
    views_widgets_edit        : { component: ()=>import('~/views/widgets/edit') },
    views_widgets_view        : { component: ()=>import('~/views/widgets/view') },
    views_tags_index          : { component: ()=>import('~/views/tags/index') },
    views_shared_login        : { component: ()=>import('~/views/shared/login') },
};

app.config(["$routeProvider", '$locationProvider', function ($routeProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix("!");
    $routeProvider.whenAsync = whenAsync; 
  
    $routeProvider.
        whenAsync('/',                                       { ...mapView(angularViewWrapper), label:'OASIS',              resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_home_index           , securized : securize(null,null, true) }}).
        whenAsync('/projects',                               { ...mapView(angularViewWrapper), label:'Projects',           resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_projects_index       , securized : securize(null,null, true) }}).
        whenAsync('/translation',                            { ...mapView(angularViewWrapper), label:'Translation',        resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_index    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/translation/project/:repository',        { ...mapView(angularViewWrapper), label:'Projects',           resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_project  , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/translation/database-tables',            { ...mapView(angularViewWrapper), label:'Translation',        resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_database , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/translation/database-tables/:table',     { ...mapView(angularViewWrapper), label:'Translation',        resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_translation_table    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/articles',                               { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_index        , securized : securize(null,null, true) }, reloadOnSearch:false}).
        whenAsync('/articles/new',                           { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        whenAsync('/articles/:id/:title?/edit',              { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/articles/:id/:title?',                   { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_article_view         , securized : securize(null,null, true) }}).
        whenAsync('/workflows',                              { ...mapView(angularViewWrapper), label:'Workflow Manager',   resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_workflows_index      , securized : securize(['Administrator', 'oasisWorkflowManager'], null, true) }}).
        whenAsync('/widgets',                                { ...mapView(angularViewWrapper), label:'Widgets',            resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_index        , securized : securize(null,null, true) }}).
        whenAsync('/widgets/new',                            { ...mapView(angularViewWrapper), label:'New',                resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        whenAsync('/widgets/:id/edit',                       { ...mapView(angularViewWrapper), label:'Edit',               resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/widgets/:id/view?',                      { ...mapView(angularViewWrapper), label:'Preview',            resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_widgets_view         , securized : securize(null,null, true) }}).
        whenAsync('/manage/:schema',                         { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_tags_index           , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        whenAsync('/signin',                                 { ...mapView(angularViewWrapper), label:'Article Editor',     resolveController: true, resolveUser : true, resolve : { ...routeTemplates.views_shared_login         , securized : securize(null,null, true) }}).
    
        otherwise({templateUrl: 'views/shared/404.html', label:'404 Error'});

}])
         
app.provider("realm", {

    $get : ["$location", 'appConfigService', function($location, appConfigService) {
        return { value : appConfigService.currentRealm || 'ABS' };
    }]
});
   

function whenAsync(path, route) {
    route = route || ({});
    var localBaseUrl = baseUrl;
  
    if (!route.controller && route.resolveController) {
      var module = route.templateUrl.replace(new RegExp("^" + escapeRegExp(localBaseUrl)), "").replace(/\.html(\.js)?/i, "");
      route.controller = importQ(module);
    }
    if (route.controller && angular.isFunction(route.controller)) {
      var controllerFn = route.controller;
      route.resolve = route.resolve || ({});
      route.resolve.lazyController = ["$injector", function ($injector) {
        var result = $injector.invoke(controllerFn, {});
        if (result.$inject) {
          result = $injector.invoke(result, {});
        }
        return result;
      }];
      if (!route.controllerAs && route.templateUrl) {
        var matches = route.templateUrl.match(/\/([A-z\-]+)\.html/);
        if (matches) {
          route.controllerAs = _.camelCase(matches[1]) + "Ctrl";
        }
      }
    }
    if (route.resolve && route.resolve.lazyController) {
      route.controller = ["$injector", "$scope", "$route", "lazyController", function ($injector, $scope, $route, lazyController) {
        if (!lazyController) return;
        var $element = angular.element(document).find("ng-view > :first-child");
        var locals = angular.extend({}, $route.current.locals, {
          $scope: $scope,
          $element: $element
        });
        return $injector.instantiate(lazyController, locals);
      }];
    }
    // if ((route.templateUrl || "").length > 0 && window.scbdApp.version) {
    //   route.templateUrl = window.addAppVersionToUrl(route.templateUrl);
    // }
    this.when(path, route);
    return this;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}