define(['app', 'lodash'], function (app, _) {
    return ['$scope', '$http', '$q', '$routeParams',
    function ($scope, $http, $q, $routeParams) {

            var repository          = $routeParams.repository;
            var repositoryQuery     = $http.get('https://api.github.com/repos/scbd/' + repository);
            var releaseQuery        = $http.get('https://api.github.com/repos/scbd/' + repository +'/releases');
            var latestReleaseQuery  = $http.get('https://api.github.com/repos/scbd/' + repository +'/releases/latest');
            $q.all([repositoryQuery, latestReleaseQuery, releaseQuery])
            .then(function(result){

                $scope.project          = result[0].data;
                $scope.latestRelease    = result[1].data;
                $scope.releases         = result[2].data;

            });

            $scope.showTranslationFiles = function(){

                if($scope.previousRelease){
                    // var compareBranch = _.where($scope.releases, {tag_name:$scope.previousRelease});
                    var url = '/api/git/'+ $scope.project.name +'?branch=' + $scope.latestRelease.tag_name +'&date='+$scope.previousRelease.created_at;
                    $q.when($http.get(url))
                    .then(function(result){
                        $scope.translationFiles          = result.data;
                    });

                }
            }
    }];
});
