'use strict';
define(['angular', 'angular-sanitize',  'angular-ui-select2', 'ng-file-upload'],
    function(angular) {

        var dependencies = ['ngRoute', 'ngCookies', 'ngSanitize', 'ckeditor','ui.select','ngFileUpload', 'angularGrid', 'angularVue'];
        
        angular.defineModules(dependencies);
        var app = angular.module('app', dependencies);

       
        return app;
    });
