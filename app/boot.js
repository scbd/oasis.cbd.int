// 'use strict';

// window.name = 'NG_DEFER_BOOTSTRAP!';

var ckeditorVersion = '35.0.0'

export const cdnHost = 'https://cdn.jsdelivr.net/'

export const bundleUrls = {
    angularBundle : [ 
        'npm/jquery@2.2.4/dist/jquery.min.js',
        'npm/angular@1.7.4/angular.min.js',
        'gh/scbd/angular-flex/angular-flex.min.js',
        'npm/angular-route@1.7.4/angular-route.min.js',
        'npm/angular-cookies@1.7.4/angular-cookies.min.js',
        'npm/angular-sanitize@1.7.4/angular-sanitize.min.js',
        'npm/angular-animate@1.7.4/angular-animate.min.js',
        'npm/angular-aria@1.7.4/angular-aria.min.js',
        'npm/angular-cache@4.6.0/dist/angular-cache.min.js',
        'npm/jqueryui@1.11.1/jquery-ui.min.js',
        'npm/lodash@4.17.15/lodash.min.js',
        'npm/moment@2.9.0/min/moment-with-locales.min.js',
        'npm/requirejs@2.2.0/require.js'
    ].join(','),
    angularDependencies: [
        'npm/ngSmoothScroll@2.0.1/dist/angular-smooth-scroll.min.js',
    ].join(','),
    initialCss: [
        'npm/bootstrap@3.3.6/dist/css/bootstrap.min.css',     
        // 'npm/font-awesome@4.4.0/css/font-awesome.min.css' 
    ].join(','),
}
export default function bootApp(window, require, defineX) {

    const document =  window.document||{};

    var appVersion = '';
    if((document||{}).documentElement)
        appVersion = (((document||{}).documentElement||{}).attributes['app-version']||{}).value;

    require.config({
        baseUrl : 'app/',
        'paths': {
            'css'                       : cdnHost + 'npm/require-css@0.1.8/css.min',
            'text'                      : cdnHost + 'npm/requirejs-text@2.0.15/text',
            'json'                      : cdnHost + 'npm/requirejs-plugins@1.0.2/src/json',
            'async'                     : cdnHost + 'npm/requirejs-text@1.0.2/lib/async',
            'domReady'                  : cdnHost + 'npm/requirejs-domready@2.0.1/domReady',

            'vueFile'                   : cdnHost + 'npm/requirejs-vue@1.1.5/requirejs-vue',
            'shim'                      : cdnHost + 'gh/zetlen/require-shim@master/src/shim',

            'ck-editor'                 : cdnHost + 'npm/@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor',        
            'select2'                   : cdnHost + 'gh/angular-ui/ui-select@0.19.8/dist/select.min',
            'angular-ui-select2'        : cdnHost + 'npm/angular-ui-select2@0.0.5/src/select2',
            'ng-file-upload-shim'       : cdnHost + 'gh/danialfarid/ng-file-upload-shim-bower@12.2.13/ng-file-upload-shim',
            'ng-file-upload'            : cdnHost + 'gh/danialfarid/ng-file-upload-shim-bower@12.2.13/ng-file-upload-all',
            
            'angulargrid'               : cdnHost + 'npm/angulargrid@0.6.5/angulargrid.min',

            'axios'                     : cdnHost + 'npm/axios@0.21.1/dist/axios',

            'vue-i18n'                  : cdnHost + 'npm/vue-i18n@8.21.1/dist/vue-i18n.min',
            'vuetify'                   : cdnHost + 'npm/vuetify@2.2.32/dist/vuetify.min',
            'angular-vue'               : `${cdnHost}npm/@scbd/angular-vue@4.0.0/dist/index.min`,
            'coreui-vue'                : cdnHost + 'npm/@coreui/vue@3.1.4/dist/coreui-vue.umd',
            'code-editor-vue'           : cdnHost + 'npm/vue-codemirror@4.0.6/dist/vue-codemirror',
            'vue-multiselect'           : `${cdnHost}npm/vue-multiselect@2.1.6/dist/vue-multiselect.min`,
            'vue-pagination-2'          : `${cdnHost}npm/vue-pagination-2@3.0.91/dist/vue-pagination-2.min`,

            'ngStorage'                 : cdnHost + 'npm/ngstorage@0.3.11/ngStorage.min',
            'toastr'                    : cdnHost + 'npm/angular-toastr@1.5.0/dist/angular-toastr.tpls.min',
            
        },
        'shim': {
            'angular-flex'                  : { 'deps': ['angular'] },
            'select2'                       : { 'deps': ['angular', `css!${cdnHost}gh/angular-ui/ui-select@0.19.8/dist/select.css`] },
            'angular-ui-select2'            : { 'deps': ['angular', 'select2']},
            'toastr'                        : { 'deps': ['angular', 'angular-animate'] },
            'ngStorage'                     : { 'deps': ['angular'] },
            'angulargrid'                   : { 'deps': ['angular']},
            'vuetify'                       : { 'deps': ['vue', `css!${cdnHost}npm/@mdi/font@5.x/css/materialdesignicons.min.css`,
                                                                `css!${cdnHost}npm/vuetify@2.x/dist/vuetify.min.css`,
                                                                'css!https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900' ]},
            'ck-editor'                     : { 'deps': ['ck-editor-css']},
            'angular-vue'                   : { 'deps': ['angular', 'vue']},
            'vueFile'                       : { 'deps': ['vue']},
            'coreui-vue'                    : { 'deps': ['vue', `css!${cdnHost}npm/@coreui/coreui@3.4.0/dist/css/coreui.css` ]},
            'code-editor-vue'               : { 'deps': ['vue', 'codemirror']},

            'vue-multiselect'               : { deps : [`css!${cdnHost}npm/vue-multiselect@2.1.6/dist/vue-multiselect.min.css`] },
            'vue-pagination-2'              : { 'deps': ['angular-vue'] },
            
        },
        // urlArgs: 'v=' + appVersion
        urlArgs: function(id, url) {

            // console.log(id)
            const hasHash  = (o)=> /-[a-f0-9]{8}$/i.test(o);
        
            if(hasHash(id))   return '';
            if(id.startsWith('http')) return '';
        
            const sep = url.indexOf('?') === -1 ? '?' : '&';
            return `${sep}v=${encodeURIComponent(appVersion)}`;
        }
    });
    //

    const noop = ()=>warnImport
    const warnImport = ()=>{ console.warn('lib loaded in bundle, import not required!'); }

    defineX('angular'              , ['bootstrap'],() =>window.angular);
    defineX('angular-flex'         , ['angular'], (ng)=>{ warnImport(); return ng; });
    defineX('angular-route'        , ['angular'], (ng)=>{ warnImport(); return ng; });
    defineX('angular-cookies'      , ['angular'], (ng)=>{ warnImport(); return ng; });
    defineX('angular-sanitize'     , ['angular'], (ng)=>{ warnImport(); return ng; });
    defineX('angular-animate'      , ['angular'], (ng)=>{ warnImport(); return ng; });
    defineX('angular-cache'        , ['angular'], (ng)=>{ warnImport(); });
    
    defineX('angular-dependencies' , ['angular', `${cdnHost}combine/${bundleUrls.angularDependencies}`], (ng)=>{ warnImport(); });
    defineX('ng-breadcrumbs'       , ['angular-dependencies'], ()=>{ warnImport(); });
    defineX('ngSmoothScroll'       , ['angular-dependencies'], ()=>{ warnImport(); });
    defineX('jquery-ui'       , ['angular-dependencies'], ()=>{ warnImport(); });
    
    defineX('angular-joyride'            , ['angular-dependencies', 'externalCss'], ()=>{ warnImport(); });
                
    
    defineX('lodash',   [], ()=>window._);
    defineX('bootstrap',[cdnHost + 'npm/bootstrap@3.3.6/dist/js/bootstrap.js'], (boostrap)=>{ return boostrap;});
    defineX('moment',   [],()=>window.moment);
    defineX('jquery',   [],()=>window.$);
    
    defineX('externalCss', [], ()=>warnImport)
    
    
    defineX('ck-editor-css', ['css!' + cdnHost + 'npm/@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor.css']);
    defineX('ck-editor-content-css', ['css!' + cdnHost + 'npm/@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/content-style.css']);

    defineX('vue', ['Vue'],                              function(Vue){ return Vue; });
    defineX('Vue', [cdnHost+'npm/vue@2.6.12/dist/vue.min.js', 'vue-i18n'], function(Vue){
        window.Vue = Vue;
        Vue.config.devtools = true;
        
        return Vue;
    })

    defineX('realmConf', [`json!/api/v2018/realm-configurations`], function(realmConf){
        return realmConf;
    })

    defineX('codemirror', [ 
        `${cdnHost}npm/codemirror@5.58.3/lib/codemirror.js`,
        `css!${cdnHost}npm/codemirror@5.58.3/lib/codemirror.css`
    ], function(codemirror) { 
        console.log(codemirror)
        return codemirror;
    });

    if(document) { // BOOT App
        const deps = [
          import('angular'),
          import('./app'),
          import('./template'),
          import(`./js/app_routes.js`)
        ];
    
        Promise.all(deps).then(([ng, { default: app }]) => {
          ng.element(document).ready(function () {
            ng.bootstrap(document, [app.name]);
          });
        }).catch((e)=>{ console.error('Error bootstrapping the app:', e) });
      } 


}

