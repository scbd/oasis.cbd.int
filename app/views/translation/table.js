import app from '~/app';
import _ from 'lodash';
import dbTables from '~/views/translation/database-tables.json';
import '~/components/scbd-angularjs-services/main';
import './directives/pagination';
import '~/services/local-storage-service';

export { default as template } from './table.html';
    export default ['$scope', '$http', '$q', '$routeParams','IGenericService','localStorageService', '$timeout', '$location',
    function ($scope, $http, $q, $routeParams, genericService, localStorageService, $timeout, $location) {
        var languages = [ 'ar', 'fr', 'es', 'ru', 'zh' ]
        $scope.baseUrl  = window.baseUrl;
        $scope.articlesToDownload = (localStorageService.get('articlesToDownload')||[]);
        $scope.articletags = [];
        $scope.articlecustomtags = [];
        $scope.articleadmintags = [];
        $scope.search = {};

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
                         return (_.first(data.data)||{count:0}).count
                        })
            }
            else
                rowCountQuery = $scope.translation.rowCount

            return $q.all([$http.get($scope.translation.api, {params: { ag : JSON.stringify(ag)}}),rowCountQuery])
            .then(function(result){
                const articleTD = (localStorageService.get('articlesToDownload')||[]);
                $scope.translation.rows          = result[0].data;
                updateSelection(articleTD)
                $scope.translation.rowCount      = result[1];
                $scope.translation.pageCount     = Math.ceil($scope.translation.rowCount / $scope.translation.itemsPerPage);
                $scope.translation.currentPage   = page;
            })
            .finally(function(){
                $scope.fetchingFiles = false;
            });
        }

        $scope.downloadFiles = function(){

            var translation = $scope.translation;
            $scope.articlesToDownload = (localStorageService.get('articlesToDownload')||[]);
            var url = baseUrl+'translation-api/database-table/'+encodeURIComponent(translation.name);
            var filesForTranslation = _.map($scope.articlesToDownload,'_id');

            if(filesForTranslation.length > 0){
                $scope.gettingSignedUrl = true;
                $http.get(url+'/signed-url', {params:{ids:filesForTranslation}})
                .then(function(result){
                    window.open(url+'/download?hash='+ encodeURIComponent(result.data),'_new');
                })
                .finally(function(){
                    $scope.gettingSignedUrl = false;
                })
            }
        }

        $scope.checkAll = function(selectAll){
            _.each($scope.translation.rows, function(row){
                row.translate = selectAll;
                if(selectAll) {
                    let index = $scope.articlesToDownload.findIndex(x => x._id==row._id);
                    if(index === -1){
                      $scope.articlesToDownload.push(row);
                    }
                    localStorageService.set('articlesToDownload', $scope.articlesToDownload, 10000);
                }
                //  else {
                //     $scope.articlesToDownload = [];
                //     localStorageService.set('articlesToDownload', []);
                // }
            });
        }
        $scope.addToDownload = function(row, $event, forceAdd){

            if($event)
                $event.stopPropagation();
            
            $scope.articlesToDownload = (localStorageService.get('articlesToDownload')||[]);
            let index = $scope.articlesToDownload?.findIndex(x => x._id==row._id);

            if(index === -1){
                $scope.articlesToDownload.push(row) 
            }
            else if(!forceAdd){
                $scope.articlesToDownload.splice(index, 1);
             }

            localStorageService.set('articlesToDownload', $scope.articlesToDownload, 10000);
            $scope.articlesToDownload = (localStorageService.get('articlesToDownload')||[]);
        }

        $scope.clearDownload = function(){
            localStorageService.set('articlesToDownload', []);
            $scope.articlesToDownload = [];
            _.each($scope.translation.rows, function(row){
                row.translate = false;
            });
        }

        $scope.onPageChange = function(page){
            load(page)
        }

        //-------------------------------------------------------------------------
        $scope.funcAsync = function (schema, query) {
            var tableName = schema.replace(/-/g, '')
            if(!query || query == ''){
                // $scope[tableName].length = 0;
                return;
            }
            // if($scope.customTags.length>0)
            //     return;
            var queryOptions = {
                    query       : { "title.en" : {"$$startsWith":query }}, 
                    pageNumber  : 0,
                    pageLength  : 100,
                    sort        : {"title.en":1},
                    field       : {"_id":1, "title":1}
                };
            genericService.query('v2017', schema, queryOptions )
            .then(function (response) {
                $scope[tableName].length = 0;
            
                for(var i=0;i<response.length; i++){
                    var tag =  response[i];
                    var recordsToVerify = [];
                    if(tableName == 'articlecustomtags')
                        recordsToVerify = $scope.search.customTags;
                    else
                        recordsToVerify = $scope.search.tags;
                    if(!_.some(recordsToVerify, function(eTag){return eTag == tag._id})){
                        $scope[tableName].push({_id:tag._id, title: tag.title});
                    }
                }
            },
            function (err) {
                console.log('ERROR!!!', err);
            }
            );
        }

        $scope.asyncAdminTags = function (query) {
            if(!query || query == ''){
                return;
            }
            
            var queryParam = {"title" : { "$$startsWith" : query }};
            genericService.query('v2021', 'article-admin-tags', {query:queryParam, pageNumber:0, pageLength:100, fields:{"title":1}})
            .then(function (response) {
                $scope.articleAdminTags = [];
                
                for(var i=0;i<response.length; i++){
                    var tag =  response[i];             
                    if(!_.some($scope.search.adminTags, function(eTag){return eTag == tag._id})){
                        $scope.articleAdminTags.push(tag);
                    }
                }
            },
            function (err) {
                console.log('ERROR!!!', err);
            }
            );
        }

        //-------------------------------------------------------------------------
        $scope.getTerm = function(term, table){

            if(term.title)
                return term.title.en;

            var searchTerm = {
                _id : term
            }
            if(term._id)
                searchTerm._id = term._id;

            var result = $filter('tagTerm')(searchTerm, table)
            // console.log(result, term)
            return result;
        }

        //-------------------------------------------------------------------------
        $scope.tagTransform = function (newTag) {
            var item = {
                title: { en : newTag}
            };
        
            return item;
        };

        //-------------------------------------------------------------------------
        $scope.searchArticles = function(search){
            // console.log(search);
            search = search || {};
            var query =  { $and : []};
            if(!search.titleContent && (search.tags||[]).length==0 && 
                (search.customTags||[]).length==0 
                && (search.adminTags||[]).length==0
                && !search?.addToDownload?.length)
                query=undefined;

            if(search.titleContent && search.titleContent!=''){
                query.$and.push({"$or" : [{"title.en": { "$$contains" : search.titleContent}}, 
                                            {"content.en": { "$$contains" : search.titleContent}}]});
            }
            
            if(search.tags && search.tags.length>0){
                query.$and.push({"tags": {$in : _.map(search.tags, function(item){ return { "$oid" :item._id} })}});
             }
             if(search.customTags && search.customTags.length>0){
                 query.$and.push({"customTags": {$in : _.map(search.customTags, function(item){ return { "$oid" :item._id} })}});
             }
             if(search.adminTags && search.adminTags.length>0){
                 query.$and.push({"adminTags": {$in : _.map(search.adminTags, function(item){ return item.title })}});
             }

            if(search.addToDownload && search.addToDownload.length>0){
                query.$and.push({'_id' : {$in : search.addToDownload.map(e=> { return { "$oid" : e }})}});
            }
            $scope.translation.query = query;
            return load(0)
        }

        $scope.clearFilters = function(){
            $scope.search = {};
            $scope.searchArticles({})
        }

        var refreshArticlesToDownloadTimeout;
        function refreshArticlesToDownload(hitNumber){
            $scope.articlesToDownload = (localStorageService.get('articlesToDownload')||[]);
            if($scope.articlesToDownload.length){
                updateSelection($scope.articlesToDownload);
                refreshArticlesToDownloadTimeout = $timeout(()=>refreshArticlesToDownload(hitNumber+1), 5000)
            }
        }

        function updateSelection(articlesToDownload){
            _.each($scope.translation.rows, function(row){
                let index = articlesToDownload.findIndex(x => x._id==row._id);
                if(index === -1){
                    row.translate = false;
                } else {
                    row.translate = true;
                }
            })
        }

        function init(){

            const searchFilter = {};
            const query = $location.search();
            if(query.addToDownload && query.addToDownload!=true){
                searchFilter.addToDownload = _.isArray(query.addToDownload) ? query.addToDownload : [query.addToDownload];
            }
            $scope.searchArticles(searchFilter).then(()=>{
                searchFilter.addToDownload.forEach(e=>{
                    const record = $scope.translation.rows.find(row=>row._id == e)
                    if(record)
                        $scope.addToDownload(record, undefined, true);
                })
            })
            refreshArticlesToDownload(0);
        }

        $scope.$on('$destroy', function(){
            clearTimeout(refreshArticlesToDownloadTimeout);
        });

        init();
    }];

