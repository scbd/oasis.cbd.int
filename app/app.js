
import angular from "angular-flex";
import 'angular-sanitize';
import 'angular-ui-select2';
import 'ng-file-upload';

var dependencies = ['ngRoute', 'ngCookies', 'ngSanitize', 'ckeditor','ui.select','ngFileUpload', 'angularGrid', 'angularVue', 'ngStorage', 'toast'];

angular.defineModules(dependencies);
var app = angular.module('app', dependencies);

export default app;
    
