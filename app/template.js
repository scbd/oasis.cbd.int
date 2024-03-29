import app from '~/app';
import './js/filters.js';
import '~/components/scbd-angularjs-services/main';
import 'angular-vue';
import 'ng-breadcrumbs'
import _ from 'lodash';
    

    app.controller('TemplateController', ['$scope', '$rootScope', 'authentication', '$q', '$location', 'breadcrumbs',
        function($scope, $rootScope, authentication, $q, $location, breadcrumbs){

          $q.when(authentication.getUser())
          .then(function(data){
            $scope.user = data;
          })

          $scope.signOut = function(){
            $q.when(authentication.signOut())
            .then(function(data){
              $scope.user = undefined;
              $location.search({ returnUrl: $location.url() });
              $location.path('/signin')
              window.reload()
            })  
          }

          $rootScope.$on('signOut', function(){
            $scope.user = undefined;
          });

          $rootScope.$on('signIn', function($evt, user){
             $scope.user = user
          });

          $scope.getBreadcrumbs = function(){
            return _.uniqBy(breadcrumbs.get(), item => { return item.path; });
          }
        }
    ]);
    app.directive(
            "mAppLoading",
            function( $animate ) {
                // Return the directive configuration.
                return({
                    link: link,
                    restrict: "C"
                });
                // I bind the JavaScript events to the scope.
                function link( scope, element, attributes ) {
                    // Due to the way AngularJS prevents animation during the bootstrap
                    // of the application, we can't animate the top-level container; but,
                    // since we added "ngAnimateChildren", we can animated the inner
                    // container during this phase.
                    // --
                    // NOTE: Am using .eq(1) so that we don't animate the Style block.
                    $animate.leave( element.children().eq( 1 ) ).then(
                        function cleanupAfterAnimation() {
                            // Remove the root directive element.
                            element.remove();
                            // Clear the closed-over variable references.
                            scope = element = attributes = null;
                        }
                    );
                }
            }
        );

