
import app from '~/app';
import _ from 'lodash';
import '~/services/app-config-service';
import '~/components/scbd-angularjs-services/main';

import { securize, mapView, importQ, injectRouteParams } from './mixin';
import * as angularViewWrapper from '~/views/shared/angular-view-wrapper'
import * as vueViewWrapper     from '~/views/shared/vue-view-wrapper'
import realmConfigurations from 'realmConf';

var baseUrl = require.toUrl("").replace(/\?v=.*$/, "");

function logError(err) {
  console.log(err)
  throw err;
}

const chmAdminRoles = realmConfigurations.map(e=>e.roles.administrator).flat()

const routeTemplates = {

    views_home_index                        : { component: ()=>import('~/views/home/index').catch(logError) },
    views_projects_index                    : { component: ()=>import('~/views/projects/index').catch(logError) },
    views_translation_index                 : { component: ()=>import('~/views/translation/index').catch(logError) },
    views_translation_project               : { component: ()=>import('~/views/translation/project').catch(logError) },
    views_translation_database              : { component: ()=>import('~/views/translation/database-tables').catch(logError) },
    views_translation_table                 : { component: ()=>import('~/views/translation/table').catch(logError) },
    views_translation_table_import          : { component: ()=>import('~/views/translation/database-tables/import.vue').catch(logError) },  
    views_article_index                     : { component: ()=>import('~/views/article/index').catch(logError) },
    views_article_editor                    : { component: ()=>import('~/views/article/editor').catch(logError) },
    views_article_view                      : { component: ()=>import('~/views/article/view').catch(logError) },
    views_workflows_index                   : { component: ()=>import('~/views/workflows/index').catch(logError) },
    views_widgets_index                     : { component: ()=>import('~/views/widgets/index').catch(logError) },
    views_widgets_edit                      : { component: ()=>import('~/views/widgets/edit').catch(logError) },
    views_widgets_view                      : { component: ()=>import('~/views/widgets/view').catch(logError) },
    views_tags_index                        : { component: ()=>import('~/views/tags/index').catch(logError) },
    views_shared_login                      : { component: ()=>import('~/views/shared/login').catch(logError) },
    views_shared_404                        : { component: ()=>import('~/views/shared/404').catch(logError) },   
    views_shared_403                        : { component: ()=>import('~/views/shared/403').catch(logError) },   

    views_chm_index                         : { component: ()=>import('~/views/clearing-house/index.vue').catch(logError) },  
    views_chm_records                       : { component: ()=>import('~/views/clearing-house/record-list.vue').catch(logError) },  
    views_chm_record_history                : { component: ()=>import('~/views/clearing-house/record-history.vue').catch(logError) }, 
    views_chm_realm_list                    : { component: ()=>import('~/views/clearing-house/realm/realm-list.vue').catch(logError) },
    views_chm_realm_details                 : { component: ()=>import('~/views/clearing-house/realm/realm-details.vue').catch(logError) },
};

app.config(["$routeProvider", '$locationProvider', function ($routeProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix("!");
  
    $routeProvider.
        when('/',                                       { ...mapView(angularViewWrapper), label:'OASIS',              resolveUser : true, resolve : { ...routeTemplates.views_home_index           , securized : securize(null,null, true) }}).
        when('/projects',                               { ...mapView(angularViewWrapper), label:'Projects',           resolveUser : true, resolve : { ...routeTemplates.views_projects_index       , securized : securize(null,null, true) }}).
        
        
        when('/translation',                            { ...mapView(angularViewWrapper), label:'Translation',        resolveUser : true, resolve : { ...routeTemplates.views_translation_index    , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/project/:repository',        { ...mapView(angularViewWrapper), label:'Projects',           resolveUser : true, resolve : { ...routeTemplates.views_translation_project  , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
                
        when('/translation/database-tables/:table',     { redirectTo : '/translation/database-tables/:table/export/' }).
        when('/translation/database-tables',            { ...mapView(angularViewWrapper), label:'Database Tables',        resolveUser : true, resolve : { ...routeTemplates.views_translation_database , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/database-tables/:table/export',{ ...mapView(angularViewWrapper), label:'Export for Translation',      resolveUser : true, resolve : { ...routeTemplates.views_translation_table          , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/translation/database-tables/:table/import',{ ...mapView(vueViewWrapper),     label:'Import from Translation',     resolveUser : true, resolve : { ...routeTemplates.views_translation_table_import   , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        
        when('/articles',                               { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_index        , securized : securize(null,null, true) }, reloadOnSearch:false}).
        when('/articles/new',                           { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        when('/articles/:id/:title?/edit',              { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_editor       , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/articles/:id/:title?',                   { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_article_view         , securized : securize(null,null, true) }}).
        
        when('/widgets',                                { ...mapView(angularViewWrapper), label:'Widgets',            resolveUser : true, resolve : { ...routeTemplates.views_widgets_index        , securized : securize(null,null, true) }}).
        when('/widgets/new',                            { ...mapView(angularViewWrapper), label:'New',                resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }, isNew:true }).
        when('/widgets/:id/edit',                       { ...mapView(angularViewWrapper), label:'Edit',               resolveUser : true, resolve : { ...routeTemplates.views_widgets_edit         , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/widgets/:id/view?',                      { ...mapView(angularViewWrapper), label:'Preview',            resolveUser : true, resolve : { ...routeTemplates.views_widgets_view         , securized : securize(null,null, true) }}).
        // when('/manage/:schema',                         { ...mapView(angularViewWrapper), label:'Article Editor',     resolveUser : true, resolve : { ...routeTemplates.views_tags_index           , securized : securize(['Administrator', 'oasisArticleEditor'],null, true) }}).
        when('/signin',                                 { ...mapView(angularViewWrapper), label:'Sign In',            resolveUser : true, resolve : { ...routeTemplates.views_shared_login         , securized : securize(null,null, true) }}).

        when('/workflows',                              { "redirectTo": '/clearing-house/records/failed-workflows'}).
        
        when('/clearing-house'                              ,{ ...mapView(vueViewWrapper)    , label:'Clearing-House Management',   resolveUser : true, resolve : { ...routeTemplates.views_chm_index            , securized : securize([...chmAdminRoles, 'Administrator'], null, true) }}).
        when('/clearing-house/records/failed-workflows'     ,{ ...mapView(angularViewWrapper), label:'Failed Workflows'         ,   resolveUser : true, resolve : { ...routeTemplates.views_workflows_index      , securized : securize([...chmAdminRoles, 'Administrator', 'oasisWorkflowManager'], null, true) }}).
        when('/clearing-house/records/history/:identifier?' ,{ ...mapView(vueViewWrapper)    , label:'Record History'           ,   resolveUser : true, resolve : { ...routeTemplates.views_chm_record_history   , securized : securize([...chmAdminRoles, 'Administrator'], null, true) }}).
        when('/clearing-house/records/:environment?/:realm?/:schema?/:government?'     ,{ ...mapView(vueViewWrapper)    , label:'Records'                  ,   resolveUser : true, resolve : { ...routeTemplates.views_chm_records          , securized : securize([...chmAdminRoles, 'Administrator'], null, true) }, reloadOnUrl:false}).        
        when('/clearing-house/realms'                       ,{ ...mapView(vueViewWrapper)    , label:'Realms'                   ,   resolveUser : true, resolve : { ...routeTemplates.views_chm_realm_list       , securized : securize([...chmAdminRoles, 'Administrator'], null, true) }}).        
        when('/clearing-house/realms/:realm?'               ,{ ...mapView(vueViewWrapper)    , label:'Realm Details'            ,   resolveUser : true, resolve : { ...routeTemplates.views_chm_realm_details    , securized : securize([...chmAdminRoles, 'Administrator'], null, true) }}).        
        
        when('/403'     ,{ ...mapView(angularViewWrapper), label:'Unauthorized Access',   resolveUser : true, resolve : { ...routeTemplates.views_shared_403 }}).        
        otherwise(       {...mapView(angularViewWrapper) , label:'404 Error', resolveUser : true, resolve : { ...routeTemplates.views_shared_404 }});

}])
         
app.provider("realm", {

    $get : ["$location", 'appConfigService', function($location, appConfigService) {
        return { value : appConfigService.currentRealm || 'ABS' };
    }]
});