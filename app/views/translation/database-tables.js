define(['app','json!views/translation/database-tables.json'], function (app, dbTables) {
    return ['$scope', function ($scope) {
            
        $scope.baseUrl  = window.baseUrl;
        $scope.dbTables = dbTables;
    }];
});
