define(['app', 
'scbd-angularjs-services/generic-service', 'js/pin-grid'], function (app) {
    

    return ['$scope', '$http', 'IGenericService', '$q', '$location', '$timeout', '$route',
        function ($scope, $http, genericService, $q, $location, $timeout, $route) {
        
            $q.when(genericService.query('v2017', $route.current.params.schema, {pageNumber:0, pageLength:100, fields:{"title.en":1}}))
                .then(function (data) {
                    $scope.tags = data;                   
                });;            

            $scope.showArticle = function(tile){ 
                var url = tile.title.en.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-')
                $location.path('/articles/'+ tile._id+ '/' + url  )
            }

            $scope.delete = function(article){

                if(window.confirm("Are you sure you want to delete this record?")){
                    $q.when(genericService.delete('v2017', $route.current.params.schema, article._id))
                    .then(function(data){
                        var index = $scope.articles.indexOf(article)
                        $scope.articles.splice(index, 1);
                    })
                }

            }
        }
    ]
});
