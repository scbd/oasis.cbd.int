define(['app', 'scbd-angularjs-services/generic-service'],
 function (app, classicEditor) {
   
    return ['$scope', '$http', 'IGenericService', '$q', '$route', '$rootScope', '$location',
        function ($scope, $http, genericService, $q, $route, $rootScope, $location) {
            
            user = $rootScope.user;
            $scope.canEdit = ~user.roles.indexOf('Administrator') || ~user.roles.indexOf('oasisArticleEditor');
            var editor;
            $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                .then(function (data) {
                    
                    data.tags = _.map(data.tags, function(t){ return {_id:t}});
                    data.customTags = _.map(data.customTags, function(t){return {_id:t}});

                    $scope.article = data;
                    
            });            

            $scope.getSizedImage = function(url, size){
                // return url;

                return url && url
                .replace(/attachments.cbd.int\//, '$&'+size+'/')
                .replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
            }
        }
    ]
});
