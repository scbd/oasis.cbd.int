define(['app', 'lodash', 'json!views/translation/database-tables.json','views/translation/directives/pagination'],
 function (app, _, dbTables) {
    return ['$scope', '$http', '$q', '$routeParams',
    function ($scope, $http, $q, $routeParams) {
        var languages = [ 'ar', 'fr', 'es', 'ru', 'zh' ]
        $scope.baseUrl  = window.baseUrl||'/';
        
        $scope.translation = _.find(dbTables, {name:$routeParams.table})
        $scope.translation.languages = [];
        $scope.translation.itemsPerPage = 50;
        $scope.translation.currentPage  = 0;
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

        function load(page){
            var ag = [{ $sort   : $scope.translation.sort || {"meta.modifiedOn":-1}},
                    { $skip     : (page||0)*$scope.translation.itemsPerPage },
                    { $limit    : $scope.translation.itemsPerPage           },
                    { $project  : fields }];
            var agCount = [{ $sort   : $scope.translation.sort || {"meta.modifiedOn":-1}}]
            var rowCountQuery;
            if($scope.translation.query){
                ag.splice(1, 0, { $match    : $scope.translation.query})
                agCount.push({ $match       : $scope.translation.query})
            }
            if(page == 0){
                agCount.push({$count:'count'})
                rowCountQuery = $http.get($scope.translation.api, {params: { ag : JSON.stringify(agCount)}})
                     .then(function(data){ 
                         return data.data[0].count
                        })
            }
            else
                rowCountQuery = $scope.translation.rowCount

            $q.all([$http.get($scope.translation.api, {params: { ag : JSON.stringify(ag)}}),rowCountQuery])
            .then(function(result){
                $scope.translation.rows          = result[0].data;
                $scope.translation.rowCount      = result[1];
                $scope.translation.pageCount     = Math.ceil($scope.translation.rowCount / $scope.translation.itemsPerPage);
                $scope.translation.currentPage   = page;
            })
            .finally(function(){
                $scope.fetchingFiles = false;
            });
        }

        $scope.dowloadFiles = function(){


            var translation = $scope.translation;

            var url = baseUrl+'translation-api/database-table/'+translation.name ;
            var filesForTranslation = _.map(_.filter($scope.translation.rows, {translate:true}), '_id');

            if(filesForTranslation.length > 0){
                $scope.gettingSignedUrl = true;
                $http.get(url+'/signed-url', {params:{ids:filesForTranslation}})
                .then(function(result){
                    window.open(url+'/download?hash='+ result.data,'_new');
                })
                .finally(function(){
                    $scope.gettingSignedUrl = false;
                })
            }
        }

        $scope.checkAll = function(selectAll){
            _.each($scope.translation.rows, function(row){
                row.translate = selectAll;
            })
        }

        $scope.onPageChange = function(page){
            load(page)
        }

        load(0)

    }];
});
