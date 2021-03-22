define(['app', 'lodash', 'scbd-angularjs-services/generic-service'], function (app, _) {

    app.controller('IndexController', ['$scope', '$http', 'IGenericService', function ($scope, $http, genericService) {
            
        
        $scope.baseUrl  = window.baseUrl;
        $scope.count    = {
            failedWorkflows:0
        };
        $scope.articles = {};


        function loadCounts (){

            $http.get('https://api.github.com/users/scbd')
            .then(function(result){
                $scope.count.projects = result.data.public_repos;
            });        

            genericService.query('v2017', 'articles', { ag : [ { $count    : 'count' } ]} )
            .then(function(result){
                $scope.count.articles = (result[0]||{}).count||0;
            });

            genericService.query('v2020', 'widgets', { ag : [ { $count    : 'count' } ]} )
            .then(function(result){
                $scope.count.widgets = (result[0]||{}).count||0;
            });

            genericService.query('v2013', 'workflows/failed-workflows', { ag : [ { $count    : 'count' } ]} )
            .then(function(result){
                $scope.count.failedWorkflows = (result[0]||{}).count||0;
            });
        }

        function loadRecords(){

            var allArticlesQuery = {
                pageNumber:1,
                pageLength:20,
                sort:{"meta.modifiedOn":-1},
                fields:{"_id":1,"title.en":1, 'meta.modifiedOn':1, 'meta.modifiedBy':1}
            };
            genericService.query('v2017', 'articles', allArticlesQuery )
            .then(function(result){
                $scope.articles.all = result;

                $scope.activeUsers = {};
                _.map(result, function(rec){
                    $scope.activeUsers[rec.meta.modifiedBy] = rec.meta.modifiedByInfo.firstName + ' ' + rec.meta.modifiedByInfo.lastName;
                })
            });

            var myArticlesQuery = {
                ag : [
                    {"$sort":{"meta.modifiedOn":-1}},
                    {"$match":{"meta.modifiedBy":15331}},
                    {"$skip":0},
                    {"$limit":20},
                    {"$project":{"_id":1,"title.en":1,"meta.modifiedOn":1, 'meta.modifiedBy':1}}
                ]
            };
            genericService.query('v2017', 'articles', myArticlesQuery )
            .then(function(result){
                $scope.articles.my = result;
            });

            var widgetsQuery = {
                ag : [
                    {"$sort":{"meta.modifiedOn":-1}},
                    {"$skip":0},
                    {"$limit":20},
                    {"$project":{"_id":1,"name":1,"meta.modifiedOn":1, 'meta.modifiedBy':1}}
                ]
            };
            genericService.query('v2020', 'widgets', widgetsQuery )
            .then(function(result){
                $scope.widgets = result;
            });
        }

        loadCounts();
        loadRecords();
    }]);
});
