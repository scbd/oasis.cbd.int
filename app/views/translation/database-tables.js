import app from '~/app';
import dbTables from '~/views/translation/database-tables.json';
export { default as template } from './database-tables.html';
    export default ['$scope', function ($scope) {
            
        $scope.baseUrl  = window.baseUrl;
        $scope.dbTables = dbTables;
    }];

