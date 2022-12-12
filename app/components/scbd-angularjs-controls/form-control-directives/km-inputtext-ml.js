import app from '~/app';
import template from './km-inputtext-ml.html';
import angular from 'angular';
  //============================================================
  //
  //
  //============================================================
  app.directive('kmTextboxMl', function() {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      require: "?ngModel",
      scope: {
        placeholder: '@',
        ngDisabledFn: '&ngDisabled',
        binding: '=ngModel',
        locales: '=',
        rows: '=',
        required: "@"
      },
      link: function($scope, element, attrs, ngModelController) {
        $scope.text = {};

        //==============================
        //Remove value of not selected languages/empty languages
        //==============================
        $scope.$watch('locales', function() {
          var oLocales = $scope.locales || [];
          var oBinding = $scope.binding || {};
          var oText = $scope.text;

          angular.forEach(oLocales, function(locale, i) {
            oText[locale] = oBinding[locale] || oText[locale];
          });
        });


        //==============================
        //Remove value of not selected languages/empty languages
        //==============================
        $scope.$watch('binding', function() {          
          var oLocales = $scope.locales || [];
          var oBinding = $scope.binding || {};
          var oText = $scope.text;

          angular.forEach(oLocales, function(locale, i) {
            oText[locale] = oBinding[locale];
          });
        });

        //==============================
        //Remove value of not selected languages/empty languages
        //==============================
        $scope.onchange = function() {
          var oLocales = $scope.locales || [];
          var oText = $scope.text || {};
          var oNewBinding = {};

          angular.forEach(oLocales, function(locale, i) {
            if ($.trim(oText[locale]) !== "")
              oNewBinding[locale] = oText[locale];
          });

          $scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
          
          ngModelController.$setViewValue($scope.binding);
        };

        //==============================
        //
        //==============================
        $scope.isRequired = function() {
          return $scope.required !== undefined && $.isEmptyObject($scope.binding);
        };

        //==============================
        //
        //==============================
        $scope.isShowLocale = function() {
          return $scope.locales && $scope.locales.length > 1;
        };

        $scope.showOtherLocales = function(){
          $scope.showOthers = !$scope.showOthers;
        }
      }
    };
  });

