define(['app', 'lodash', 'json!views/translation/database-tables.json'], function (app, _, dbTables) {
    return ['$scope', '$http', '$q', '$routeParams',
    function ($scope, $http, $q, $routeParams) {
            
        $scope.baseUrl  = window.baseUrl||'/';
        $scope.dbTables = dbTables;
    }];
});
