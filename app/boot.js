// 'use strict';

// window.name = 'NG_DEFER_BOOTSTRAP!';

var ckeditorVersion = '35.0.0'

export const cdnUrl = 'https://cdn.jsdelivr.net/'

export const bundleUrls = {
    angularBundle : [ 
        'npm/jquery@2.2.4/dist/jquery.min.js',
        'npm/angular@1.7.4/angular.min.js',
        'gh/scbd/angular-flex/angular-flex.min.js',
        'npm/angular-route@1.7.4/angular-route.min.js',
        'npm/angular-cookies@1.7.4/angular-cookies.min.js',
        'npm/angular-sanitize@1.7.4/angular-sanitize.min.js',
        'npm/angular-animate@1.7.4/angular-animate.min.js',
        'npm/angular-cache@4.6.0/dist/angular-cache.min.js',
        'npm/jqueryui@1.11.1/jquery-ui.min.js',
        'npm/lodash@4.17.15/lodash.min.js',
        'npm/moment@2.9.0/min/moment-with-locales.min.js',
        'npm/requirejs@2.2.0/require.js'
    ].join(','),
    angularDependencies: [
        'npm/ngSmoothScroll@2.0.1/dist/angular-smooth-scroll.min.js',
        'npm/angular-breadcrumbs@0.5.3/dist/ng-breadcrumbs.min.js',
        'npm/angular-trix@1.0.2/dist/angular-trix.min.js',
        'npm/trix@0.12.0/dist/trix.js',
        'npm/angular-joyride@1.0.2/dist/joyride.min.js',
    ].join(','),
    initialCss: [
        'npm/bootstrap/dist/css/bootstrap.min.css',      
    ].join(','),
}
export default function bootApp(window, require, defineX) {

    const document =  window.document||{};

    var appVersion = '';
    if((document||{}).documentElement)
        appVersion = (((document||{}).documentElement||{}).attributes['app-version']||{}).value;

    const cdnHost = cdnUrl+'npm/';
    const templateName = ((window||{}).scbdApp||{}).template;


        require.config({
        baseUrl : 'app/',
        'paths': {
            'css'                       : 'libs/require-css/css.min',
            'text'                      : 'libs/requirejs-text/text',
            'json'                      : 'libs/requirejs-plugins/src/json',
            'vueFile'                   : 'https://cdn.cbd.int/requirejs-vue@1.1.5/requirejs-vue',
            'shim'                      : 'libs/require-shim/src/shim',
            'angular-localizer'         : 'libs/ngLocalizer/localizer',
            'async'                     : 'libs/requirejs-plugins/src/async',
            'domReady'                  : 'libs/requirejs-domready/domReady',
            'jquery'                    : 'libs/jquery/dist/jquery.min',
            'lodash'                    : 'libs/lodash/dist/lodash.min',
            'moment'                    : 'libs/momentjs/min/moment-with-langs.min',
            'angular-animate'           : 'libs/angular-animate/angular-animate.min',
            'angular-flex'              : 'libs/angular-flex/angular-flex',
            'ngAria'                    : 'libs/angular-aria/angular-aria.min',
            'angular-ckeditor'          : 'libs/angular-ckeditor/angular-ckeditor',
            'ck-editor'                 : cdnHost + '@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor',        
            'select2'                   : 'libs/select2/dist/js/select2.min',
            'angular-ui-select2'        : 'libs/angular-ui-select/dist/select',
            'ng-file-upload-shim'       : 'libs/ng-file-upload-shim/ng-file-upload-shim',
            'ng-file-upload'            : 'libs/ng-file-upload/ng-file-upload-all',
            'angulargrid'               : 'libs/angulargrid/angulargrid',

            'vuetify'                   : cdnHost + 'vuetify@2.2.32/dist/vuetify.min',
            'axios'                     : cdnHost + 'axios@0.21.1/dist/axios',
            'angular-vue'               : cdnHost + '@scbd/angular-vue@2.0.0/dist/angular-vue.min',
            'coreui-vue'                : cdnHost + '@coreui/vue@3.1.4/dist/coreui-vue.umd',
            'code-editor-vue'           : cdnHost + 'vue-codemirror@4.0.6/dist/vue-codemirror',

            'ngStorage'                 : cdnHost + 'ngstorage@0.3.11/ngStorage.min',
            'toastr'                    : cdnHost + 'angular-toastr@1.5.0/dist/angular-toastr.tpls.min',
            
        },
        'shim': {
            'angular-localizer'             : { 'deps':['angular']},
            'angular-flex'                  : { 'deps': ['angular'] },
            'scbd-angularjs-services'       : { 'deps': ['angular']},
            'scbd-angularjs-filters'        : { 'deps': ['angular']},
            'scbd-angularjs-controls'       : { 'deps': ['angular', 'angular-sanitize', 'angular-localizer']},
            'ngAria'                        : { 'deps': ['angular'] },
            'select2'                       : { 'deps': ['angular', 'jquery'] },
            'angular-ui-select2'            : { 'deps': ['angular', 'select2']},

            'toastr'                        : { 'deps': ['angular', 'angular-animate'] },
            'ngStorage'                     : { 'deps': ['angular'] },

            'angulargrid'                   : { 'deps': ['angular']},
            'vuetify'                       : { 'deps': ['vue', 'css!https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css',
                                                            'css!https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css',
                                                            'css!https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900' ]},
            'ck-editor'                     : { 'deps': ['ck-editor-css']},
            'angular-vue'                   : { 'deps': ['angular', 'vue']},
            'vueFile'                       : { 'deps': ['vue']},
            'coreui-vue'                    : { 'deps': ['vue', 'css!https://cdn.cbd.int/@coreui/coreui@3.4.0/dist/css/coreui.css' ]},
            'code-editor-vue'               : { 'deps': ['vue', 'codemirror' ]},
            
        },
        packages: [
            { name: 'scbd-branding'          , location : 'components/scbd-branding' },
            { name: 'scbd-angularjs-controls', location : 'components/scbd-angularjs-controls/form-control-directives', main : 'all-controls.js' },
            { name: 'scbd-angularjs-services', location : 'components/scbd-angularjs-services/services' },
            { name: 'scbd-angularjs-filters',  location : 'components/scbd-angularjs-services/filters' }
        ],
        urlArgs: 'v=' + appVersion
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
    
    defineX('angular-dependencies' , ['angular', `${cdnUrl}combine/${bundleUrls.angularDependencies}`], (ng)=>{ warnImport(); });
    defineX('ng-breadcrumbs'       , ['angular-dependencies'], ()=>{ warnImport(); });
    defineX('ngSmoothScroll'       , ['angular-dependencies'], ()=>{ warnImport(); });
    defineX('jquery-ui'       , ['angular-dependencies'], ()=>{ warnImport(); });
    
    defineX('angular-joyride'            , ['angular-dependencies', 'externalCss'], ()=>{ warnImport(); });
                
    
    defineX('lodash',   [], ()=>window._);
    defineX('bootstrap',[cdnHost + 'bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js'], (boostrap)=>{ return boostrap;});
    defineX('moment',   [],()=>window.moment);
    defineX('jquery',   [],()=>window.$);
    
    defineX('externalCss', [], ()=>warnImport)
    
    
    defineX('ck-editor-css', ['css!' + cdnHost + '@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor.css']);
    defineX('ck-editor-content-css', ['css!' + cdnHost + '@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/content-style.css']);

    defineX('vue', ['Vue'],                              function(Vue){ return Vue; });
    defineX('Vue', ['https://cdn.cbd.int/vue@2.6.12/dist/vue'], function(Vue){
        window.Vue = Vue;
        return Vue;
    })

    defineX('codemirror', [ 'https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror',
                    "css!https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror.css", 
    ], function(codemirror) { 
        return codemirror;
    });

    // if(templateName){
        import(`./template.js`);
    // }
    // else {
    //     window.alert('Unable to load files from server: ' + `./template.js`);
    // }


}

