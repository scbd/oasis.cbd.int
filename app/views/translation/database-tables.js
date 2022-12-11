import app from 'app';
import dbTables from 'json!views/translation/database-tables.json';
    export default ['$scope', function ($scope) {
            
        $scope.baseUrl  = window.baseUrl;
        $scope.dbTables = dbTables;
    }];

