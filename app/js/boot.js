'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

var appVersion = document.documentElement.attributes['app-version'].value;
var ckeditorVersion = '22.0.0'
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
        'ck-editor'                 : 'https://cdn.cbd.int/@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor',        
        'select2'                   : 'libs/select2/dist/js/select2.min',
        'angular-ui-select2'        : 'libs/angular-ui-select/dist/select',
        'ng-file-upload-shim'       : 'libs/ng-file-upload-shim/ng-file-upload-shim',
        'ng-file-upload'            : 'libs/ng-file-upload/ng-file-upload-all',
        'angulargrid'               : 'libs/angulargrid/angulargrid',

        'vuetify'                   : 'https://cdn.cbd.int/vuetify@2.2.32/dist/vuetify.min',
        'axios'                     : 'https://cdn.cbd.int/axios@0.19.2/dist/axios.min',
        'angular-vue'               : 'https://cdn.cbd.int/@scbd/angular-vue@1.0.5/dist/angular-vue.min',
        'coreui-vue'                : 'https://cdn.cbd.int/@coreui/vue@3.1.4/dist/coreui-vue.umd',
        'code-editor-vue'           : 'https://cdn.cbd.int/vue-codemirror@4.0.6/dist/vue-codemirror',
        'codemirror'                : 'https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror',

        
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

        'angulargrid'                   : { 'deps': ['angular']},
        'vuetify'                       : { 'deps': ['vue', 'css!https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css',
                                                         'css!https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css',
                                                         'css!https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900' ]},
        'ck-editor'                     : { 'deps': ['ck-editor-css']},
        'angular-vue'                   : { 'deps': ['angular', 'vue']},
        'vueFile'                       : { 'deps': ['vue']},
        'coreui-vue'                    : { 'deps': ['vue', ]},
        'codemirror'                    : { 'deps': ['jquery' ]},
        'code-editor-vue'               : { 'deps': ['vue', 'code-mirror-dep' ]},
        
    },
    packages: [
        { name: 'scbd-branding'          , location : 'components/scbd-branding' },
        { name: 'scbd-angularjs-controls', location : 'components/scbd-angularjs-controls/form-control-directives', main : 'all-controls.js' },
        { name: 'scbd-angularjs-services', location : 'components/scbd-angularjs-services/services' },
        { name: 'scbd-angularjs-filters',  location : 'components/scbd-angularjs-services/filters' }
    ],
    urlArgs: 'v=' + appVersion
});
//'css!https://cdn.cbd.int/@coreui/coreui@3.4.0/dist/css/coreui.min.css' 
define('ck-editor-css', ['css!https://cdn.cbd.int/@scbd/ckeditor5-build-inline-full@'+ ckeditorVersion + '/build/ckeditor.css']);

define('vue', ['https://cdn.cbd.int/vue/dist/vue'], function(Vue){
    window.Vue = Vue;
    return Vue;
})
define('Vue', ['https://cdn.cbd.int/vue/dist/vue'], function(Vue){
    window.Vue = Vue;
    return Vue;
})

define('code-mirror-dep', ['codemirror','https://cdn.cbd.int/codemirror@5.58.3/addon/mode/simple',
'https://cdn.cbd.int/codemirror@5.58.3/addon/mode/multiplex',
'https://cdn.cbd.int/codemirror@5.58.3/addon/edit/matchbrackets',
'https://cdn.cbd.int/codemirror@5.58.3/mode/css/css',
'https://cdn.cbd.int/codemirror@5.58.3/mode/xml/xml',
'https://cdn.cbd.int/codemirror@5.58.3/mode/handlebars/handlebars',
'https://cdn.cbd.int/codemirror@5.58.3/addon/selection/active-line',
'https://cdn.cbd.int/codemirror@5.58.3/addon/edit/closetag',
'css!https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror.css',
'css!https://cdn.cbd.int/codemirror@5.58.3/theme/base16-dark.css'])

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
