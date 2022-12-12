import app from '~/app';
import template from './lwfc-autocomplete.html';
  app.directive('lwfcAutocomplete', function() {
      return {
          restrict: 'AEC',
          scope: {
              binding: '=ngModel',
              source: '=',
              preview: '=?',
              title: '@',
              placeholder: '@',
              help: '@?',
              maxmatches: '@?',
              minchars: '@?',
              selectbox: '@?',
          },
          template: template,
      };
  });
