'use strict';
define(['angular', 'angular-sanitize',  'angular-ui-select2','ngMaterial', 'ng-file-upload'],
    function(angular) {

        var dependencies = ['ngRoute', 'ngCookies', 'angulartics', 'ngSanitize',
            'angulartics.google.analytics', 'ckeditor', 
            'ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'ui.select', 'ngFileUpload'
        ];
        
        angular.defineModules(dependencies);
        var app = angular.module('app', dependencies);

       
        return app;
    });
