define(['app', 
'scbd-angularjs-services/generic-service', 
'scbd-angularjs-services/authentication', 
'js/pin-grid', 'angular-ui-select2', 'angulargrid', 'components/scbd-angularjs-controls/form-control-directives/ng-enter',
'services/local-storage-service'], function (app) {
    
// 'ngInfiniteScroll',
    return ['$scope', '$http', 'IGenericService', '$q', '$location', '$timeout', 'authentication', 'angularGridInstance', '$rootScope', '$route','localStorageService', 
        function ($scope, $http, genericService, $q, $location, $timeout, authentication, angularGridInstance, $rootScope, $route, localStorageService) {
            var currentPage=0;
            var articlesCount=0;
            var pageSize=20
            var currentQuery;
            var previousParams;

            
            $scope.articletags          = [];
            $scope.articlecustomtags    = [];
            $scope.articleAdminTags     = [];
            $scope.layout = 'grid';
            $scope.baseUrl = window.baseUrl;
            setSearchFilters();

            //-------------------------------------------------------------------------
             $scope.showArticle = function(tile){ 
                var url = tile.title.en.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-')
                $location.path('/articles/'+ tile._id+ '/' + url  )
            }
            //-------------------------------------------------------------------------
            $scope.delete = function($evt, article){

                if(window.confirm("Are you sure you want to delete this record?")){
                    $q.when(genericService.delete('v2017', 'articles', article._id))
                    .then(function(data){
                        var index = $scope.articles.indexOf(article)
                        $scope.articles.splice(index, 1);
                    })
                }
                else{
                    $evt.stopPropagation();
                    return false;
                }

            }

            $scope.edit = function($event, article) {
                $location.path('articles/'+article._id+'/edit')                
                $event.stopPropagation();
                return false;
            }
            //-------------------------------------------------------------------------
            $scope.getSizedImage = function(url, size){

                return url && url
                .replace(/attachments.cbd.int\//, '$&'+size+'/')
                .replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
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

                if(term && term.title)
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

            $scope.tagAdminTransform = function (newTag) {
                var item = {
                    title: newTag
                };
            
                return item;
            };

            //-------------------------------------------------------------------------
            $scope.searchArticles = function(search){
                // console.log(search);
                updateQS();
                var query =  { $and : []};
                if(!search.titleContent && (search.tags||[]).length==0 && (search.customTags||[]).length==0 && (search.adminTags||[]).length==0)
                    query=undefined;

                if(search.titleContent && search.titleContent!=''){
                    query.$and.push({"$or" : [{"title.en": { "$$contains" : search.titleContent}}, 
                                              {"content.en": { "$$contains" : search.titleContent}}]});
                }

                if(search.tags && search.tags.length>0){
                   query.$and.push({"tags": {$all : _.map(search.tags, function(item){ return { "$oid" :item._id} })}});
                }
                if(search.customTags && search.customTags.length>0){
                    query.$and.push({"customTags": {$all : _.map(search.customTags, function(item){ return { "$oid" : item._id} })}});
                }
                if(search.adminTags && search.adminTags.length>0){
                    query.$and.push({"adminTags": {$all : _.map(search.adminTags, function(item){ return item.title })}});
                }

                currentQuery = query;
                currentPage = 0;
                $scope.articles=[];
                // angularGridInstance.gallery.refresh();

                var queryOptions = { ag : [ ]};

                if(query && Object.keys(query).length>0)
                    queryOptions.ag.push({ $match    : query});
                
                queryOptions.ag.push({ $count    : 'count' });
                    

                $q.when(genericService.query('v2017', 'articles', queryOptions ))
               .then(function(result){
                   
                    $scope.articlesCount = articlesCount = (result[0]||{}).count||0;
                    
                    $.when($scope.updateScrollPage(query))
                    .then(function(){
                        $timeout(function(){
                            angularGridInstance.gallery.refresh();
                        // var layout = $scope.layout;
                        // // $scope.changeLayout ('list');
                        // $scope.changeLayout (layout);
                        }, 1000)
                    });
               })
            }

            $scope.changeLayout = function(layout){
                $scope.layout = layout;
                angularGridInstance.gallery.refresh();
            }

            $scope.updateScrollPage = function(query){
                if($scope.isLoading || articlesCount<currentPage)
                    return;

                $scope.isLoading = true;

                var queryOptions = {query : (query||currentQuery),
                    pageNumber:currentPage,
                    pageLength:pageSize,
                    sort:{"meta.modifiedOn":-1},
                    fields:{"_id":1,"title.en":1, "content.en":1, coverImage:1, 'meta.modifiedOn':1, 'meta.modifiedBy':1}
                };
                
                if(queryOptions.query && Object.keys(queryOptions.query).length>0){
                    var ag = [{ $sort   : queryOptions.sort},
                            { $match    : queryOptions.query},
                            { $skip     : currentPage },
                            { $limit    : pageSize },
                            { $project  : queryOptions.fields }];

                    queryOptions = { ag : ag };
                }

                return genericService.query('v2017', 'articles', queryOptions)
                        .then(function(data){
                            if(!$scope.articles)
                                $scope.articles=[];
                            $scope.articles = $scope.articles.concat(data);
                             
                             currentPage += pageSize;
                        })
                        .finally(function(){$scope.isLoading=false;})
            }

            $scope.clearFilters = function(){
                $scope.search = {}
                $scope.searchArticles($scope.search);
            }

            $scope.newArticle = function(fromTags){
                var params = ''
                if(fromTags){
                    var qs = $location.search()
                    params = '?tags='+_.map(qs.tags||[], encodeURIComponent)+
                         '&customTags='+_.map(qs.customTags||[], encodeURIComponent)+
                         '&adminTags='+_.map(qs.adminTags||[], encodeURIComponent)
                }
                $location.url($scope.baseUrl + 'articles/new' + params)
            }

            function updateQS(){
                if($scope.search.titleContent == '')
                    $location.search('title',       undefined);
                else
                    $location.search('title',       $scope.search.titleContent);

                $location.search('tags',        _.map($scope.search.tags, '_id'))
                $location.search('customTags',  _.map($scope.search.customTags, '_id'))
                $location.search('adminTags',   _.map($scope.search.adminTags, 'title'))

                localStorageService.set('title',        $scope.search.titleContent              , 10);
                localStorageService.set('tags',         _.map($scope.search.tags, '_id')   , 10);
                localStorageService.set('customTags',   _.map($scope.search.customTags, '_id')  , 10);
                localStorageService.set('adminTags',    _.map($scope.search.adminTags, 'title')       , 10);
            }

            function getSearchFilters(){
                var query = $location.search();
                
                query.tags          = (query.tags      ||[]).length ? query.tags       : (localStorageService.get('tags')||[]);
                query.customTags    = (query.customTags||[]).length ? query.customTags : (localStorageService.get('customTags')||[]);
                query.adminTags     = (query.adminTags ||[]).length ? query.adminTags  : (localStorageService.get('adminTags')||[]);
                query.title         = (query.title     ||[]).length ? query.title      : (localStorageService.get('title'));
             
                return query;
            }

            function setSearchFilters(){
                var query = getSearchFilters();
                $scope.search = {
                    tags        : _(_.isArray(query.tags      ) ? query.tags       : (query.tags      ||'').split(',')).compact().map(function(tag){return {_id:tag}}).value(),
                    customTags  : _(_.isArray(query.customTags) ? query.customTags : (query.customTags||'').split(',')).compact().map(function(tag){return {_id:tag}}).value(),
                    adminTags   : _(_.isArray(query.adminTags ) ? query.adminTags  : (query.adminTags ||'').split(',')).compact().map(function(tag){return {title:tag}}).value(),
                    titleContent: query.title||''
                };
            }

            function init(){
                $q.all([authentication.getUser()])
                    .then(function (results) {
                        var user = results[0];
                        if(~user.roles.indexOf('Administrator') || ~user.roles.indexOf('oasisArticleEditor'))
                            $scope.isAuthorizedForActions = true;
                        $scope.searchArticles($scope.search);
                });;
            }

           init();

           // since reloadOnSearch is set to false so the search params can be updated to QS, if the base route /articles is click on the app
           // there is no trigger, so use routeUpdate to track it.
            $rootScope.$on('$routeUpdate', function(a,b) {
                if(!_.isEmpty(previousParams) && _.isEmpty($route.current.params)){
                    // $scope.clearFilters();
                    setSearchFilters()
                    $scope.searchArticles($scope.search);
                }
                previousParams = $route.current.params;
            })
        }
    ]
});
