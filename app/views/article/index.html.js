define(['app', 
'scbd-angularjs-services/generic-service', 'scbd-angularjs-services/authentication', 'js/pin-grid'], function (app) {
    

    return ['$scope', '$http', 'IGenericService', '$q', '$location', '$timeout', 'authentication',
        function ($scope, $http, genericService, $q, $location, $timeout, authentication) {
            
            $q.all([authentication.getUser(), genericService.query('v2017', 'articles')])
                .then(function (results) {
                    var user = results[0];
                    if(user.roles.indexOf('Adminstrator') || user.roles.indexOf('oasis-article-editor'))
                        $scope.isAuthorizedForActions = true;
                        
                    $scope.articles = results[1]
                    $timeout(function(){
                        $('#pinBoot').pinterest_grid({
                            no_columns: 4,
                            padding_x: 10,
                            padding_y: 10,
                            margin_bottom: 50,
                            single_column_breakpoint: 700
                        });
                    }, 100)
                });;
            

            $scope.showArticle = function(tile){ 
                var url = tile.title.en.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-')
                $location.path('/articles/'+ tile._id+ '/' + url  )
            }

            $scope.delete = function(article){

                if(window.confirm("Are you sure you want to delete this record?")){
                    $q.when(genericService.delete('v2017', 'articles', article._id))
                    .then(function(data){
                        var index = $scope.articles.indexOf(article)
                        $scope.articles.splice(index, 1);
                    })
                }

            }

            $scope.getSizedImage = function(url, size){

                return url && url.replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
            }
            
        }
    ]
});
