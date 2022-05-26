'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

var appVersion = document.documentElement.attributes['app-version'].value;
var ckeditorVersion = '34.0.0'
var cdnHost = 'https://cdn.cbd.int/'
require.config({
    baseUrl : 'app/',
    'paths': {
        'angular'                   : 'libs/angular/angular.min',
        'angular-route'             : 'libs/angular-route/angular-route.min',
        'angular-cookies'           : 'libs/angular-cookies/angular-cookies.min',
        'angular-sanitize'          : 'libs/angular-sanitize/angular-sanitize.min',
        'css'                       : 'libs/require-css/css.min',
        'text'                      : 'libs/requirejs-text/text',
        'json'                      : 'libs/requirejs-plugins/src/json',
        'vueFile'                   : 'https://cdn.cbd.int/requirejs-vue@1.1.5/requirejs-vue',
        'shim'                      : 'libs/require-shim/src/shim',
        'angular-localizer'         : 'libs/ngLocalizer/localizer',
        'async'                     : 'libs/requirejs-plugins/src/async',
        'domReady'                  : 'libs/requirejs-domready/domReady',
        'jquery'                    : 'libs/jquery/dist/jquery.min',
        'bootstrap'                 : 'libs/bootstrap/dist/js/bootstrap.min',
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
        'angular'                       : { 'deps': ['jquery'], 'exports': 'angular' },
        'angular-route'                 : { 'deps': ['angular'] },
        'angular-cookies'               : { 'deps': ['angular'] },
        'angular-sanitize'              : { 'deps': ['angular'] },
        'bootstrap'                     : { 'deps': ['jquery'] },
        'angular-animate'               : { 'deps': ['angular']},
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
define('ck-editor-css', ['css!https://cdn.cbd.int/@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor.css']);

define('vue', ['Vue'],                              function(Vue){ return Vue; });
define('Vue', ['https://cdn.cbd.int/vue@2.6.12/dist/vue'], function(Vue){
    window.Vue = Vue;
    return Vue;
})

define('codemirror', [ 'https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror',
                   "css!https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror.css", 
], function(codemirror) { 
    return codemirror;
});

require(['angular', 'angular-flex', 'angular-route', 'angular-cookies',  'bootstrap', 'domReady'
    /*, 'main'*/], function (ng) {
    // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

    require(['domReady!', 'main'], function (document) {
        ng.bootstrap(document, ['app']);
        try {
        ng.resumeBootstrap();
        } catch(err) {
          console.log('err', err);
        }
    });
});
