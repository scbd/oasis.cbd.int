import app from '~/app';
import _ from 'lodash';


export { default as template } from './project.html';
    export default ['$scope', '$http', '$q', '$routeParams',
    function ($scope, $http, $q, $routeParams) {
            var baseUrl = $scope.baseUrl = window.baseUrl;

            var repository          = $routeParams.repository;
            var repositoryQuery     = $http.get('https://api.github.com/repos/scbd/' + encodeURIComponent(repository));
            var releaseQuery        = $http.get('https://api.github.com/repos/scbd/' + encodeURIComponent(repository) +'/releases');
            var latestReleaseQuery  = $http.get('https://api.github.com/repos/scbd/' + encodeURIComponent(repository) +'/releases/latest');

            $scope.translation = {
                includeFolders: 'app/app-text',
                ignoreFolders: 'i18n, app/app-data',
                ignoreFiles : 'bower.json, package.json,.bower.json,.awsbox.json,realm-configuration.json, offline-formats.json, '+
                              'help-guides.json, help-videos.json',
                allowedExtensions : ".json"
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
                    var url = baseUrl+'translation-api/git/'+ encodeURIComponent($scope.project.name);
                    var params = {
                        branch              : $scope.latestRelease.tag_name,
                        date                : $scope.translation.previousRelease.created_at,
                        ignoreFolders        : $scope.translation.ignoreFolders,
                        includeFolders      : $scope.translation.includeFolders,
                        ignoreFiles         : $scope.translation.ignoreFiles,
                        allowedExtensions   : $scope.translation.allowedExtensions
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

            $scope.downloadFiles = function(){
               
                if($scope.translation.previousRelease){

                    var url = baseUrl+'translation-api/git/'+ encodeURIComponent($scope.project.name);
                    var params = {
                        branch              : $scope.latestRelease.tag_name,
                        date                : $scope.translation.previousRelease.created_at,
                        ignoreFolders        : $scope.translation.ignoreFolders,
                        includeFolders      : $scope.translation.includeFolders,
                        ignoreFiles         : $scope.translation.ignoreFiles,
                        allowedExtensions  : $scope.translation.allowedExtensions
                    }
                    if($scope.translation.allFiles)
                        params.date = undefined;

                    $scope.gettingSignedUrl = true;
                    $http.get(url+'/signed-url', {params:params})
                    .then(function(result){
                        window.open(url+'/download?hash='+ encodeURIComponent(result.data),'_new');
                    })
                    .finally(function(){
                        $scope.gettingSignedUrl = false;
                    })
                }
            }
    }];

