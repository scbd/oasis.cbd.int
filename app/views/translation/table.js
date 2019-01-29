define(['app', 'lodash', 'json!views/translation/database-tables.json'], function (app, _, dbTables) {
    return ['$scope', '$http', '$q', '$routeParams',
    function ($scope, $http, $q, $routeParams) {
        var languages = [ 'ar', 'fr', 'es', 'ru', 'zh' ]
        $scope.baseUrl  = window.baseUrl||'/';
        
        $scope.translation = _.find(dbTables, {name:$routeParams.table})
        $scope.translation.languages = [];
        $scope.fetchingFiles = true;
        var fields = {_id:1}
        _.each($scope.translation.fields, function(f){
            fields[f] = 1
            _.each(languages, function(l){
                $scope.translation.languages.push({
                    field: f, language : l
                })
            })
            // $scope.translation.languages = _.concat($scope.translation.languages, languages);
        })
        var ag = [{ $sort   : $scope.translation.sort || {"meta.modifiedOn":-1}},
                { $skip     : 0 },
                { $limit    : 50 },
                { $project  : fields }];

        $q.when($http.get($scope.translation.api, {params: { ag : JSON.stringify(ag)}}))
        .then(function(result){
            $scope.translation.rows          = result.data;
        })
        .finally(function(){
            $scope.fetchingFiles = false;
        });

        $scope.dowloadFiles = function(){
            var translation = $scope.translation;

            var url = '/translation-api/database-table/'+translation.name +'?zip=true';
            var filesForTranslation = _.map(_.filter($scope.translation.rows, {translate:true}), '_id');

            if(filesForTranslation.length > 0){
                url += '&ids='+filesForTranslation.join('&ids=')
                window.open(url,'_new');
            }
        }

        $scope.checkAll = function(selectAll){
            _.each($scope.translation.rows, function(row){
                row.translate = selectAll;
            })
        }

    }];
});
