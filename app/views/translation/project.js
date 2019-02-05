define(['app', 'lodash'], function (app, _) {
    return ['$scope', '$http', '$q', '$routeParams',
    function ($scope, $http, $q, $routeParams) {
            var baseUrl = $scope.baseUrl = window.baseUrl||'/';
            var repository          = $routeParams.repository;
            var repositoryQuery     = $http.get('https://api.github.com/repos/scbd/' + repository);
            var releaseQuery        = $http.get('https://api.github.com/repos/scbd/' + repository +'/releases');
            var latestReleaseQuery  = $http.get('https://api.github.com/repos/scbd/' + repository +'/releases/latest');

            $scope.translation = {
                ignoreFiles : "bower.json, package.json,.bower.json,.awsbox.json",
                allowedExtenstions : ".html, .json"
            };

            $q.all([repositoryQuery, latestReleaseQuery, releaseQuery])
            .then(function(result){

                $scope.project          = result[0].data;
                $scope.latestRelease    = result[1].data;
                $scope.releases         = result[2].data;

            });

            $scope.showTranslationFiles = function(){

                if($scope.translation.previousRelease){
                    $scope.fetchingFiles = true;
                    // var compareBranch = _.where($scope.releases, {tag_name:$scope.previousRelease});
                    var url = baseUrl+'translation-api/git/'+ $scope.project.name;
                    var params = {
                        branch              : $scope.latestRelease.tag_name,
                        date                : $scope.translation.previousRelease.created_at,
                        ignoreFiles         : $scope.translation.ignoreFiles,
                        allowedExtenstions   : $scope.translation.allowedExtenstions
                    }
                    if($scope.translation.allFiles)
                        params.date = undefined;
                        
                    $q.when($http.get(url, {params:params}))
                    .then(function(result){
                        $scope.translation.files          = result.data;
                    })
                    .finally(function(){
                        $scope.fetchingFiles = false;
                    });

                }
            }

            $scope.dowloadFiles = function(){
               
                if($scope.translation.previousRelease){

                    var url = baseUrl+'translation-api/git/'+ $scope.project.name;
                    var params = {
                        branch              : $scope.latestRelease.tag_name,
                        date                : $scope.translation.previousRelease.created_at,
                        ignoreFiles         : $scope.translation.ignoreFiles,
                        allowedExtenstions  : $scope.translation.allowedExtenstions
                    }
                    if($scope.translation.allFiles)
                        params.date = undefined;

                    $scope.gettingSignedUrl = true;
                    $http.get(url+'/signed-url', {params:params})
                    .then(function(result){
                        window.open(url+'/download?hash='+ result.data,'_new');
                    })
                    .finally(function(){
                        $scope.gettingSignedUrl = false;
                    })
                }
            }
    }];
});
