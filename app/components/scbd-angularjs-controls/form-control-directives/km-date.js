import app from 'app';
import template from 'text!./km-date.html';
import 'bootstrap-datepicker';
  
  //============================================================
  //
  //
  //============================================================
  app.directive('kmDate', [function() {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      transclude: false,
      scope: {
        binding: '=ngModel',
        placeholder: '@',
        ngDisabledFn: '&ngDisabled',
        ngChange: '&'
      },
      link: function($scope, $element, $attr) {
        $element.datepicker({
          format: "yyyy-mm-dd",
          autoclose: true
        }).on('changeDate', function(event) {
          $element.find('input').focus();
        });
        $scope.$watch('binding', function(newVal) {
          if ($scope.ngChange)
            $scope.ngChange();
        });
      },
      controller: ["$scope", function($scope) {}]
    };
  }]);

