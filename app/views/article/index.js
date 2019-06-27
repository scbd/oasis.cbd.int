define(['app', 
'scbd-angularjs-services/generic-service', 
'scbd-angularjs-services/authentication', 
'js/pin-grid', 'angular-ui-select2', 'angulargrid'], function (app) {
    
// 'ngInfiniteScroll',
    return ['$scope', '$http', 'IGenericService', '$q', '$location', '$timeout', 'authentication', 'angularGridInstance',
        function ($scope, $http, genericService, $q, $location, $timeout, authentication, angularGridInstance) {
            var currentPage=0;
            var articlesCount=0;
            var pageSize=20
            var currentQuery;

            $scope.articletags = [];
            $scope.articlecustomtags = [];
            $scope.articleadmintags = [];
            $scope.search = {};
            $scope.layout = 'grid';

            //-------------------------------------------------------------------------
             $scope.showArticle = function(tile){ 
                var url = tile.title.en.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-')
                $location.path('/articles/'+ tile._id+ '/' + url  )
            }
            //-------------------------------------------------------------------------
            $scope.delete = function(article){

                if(window.confirm("Are you sure you want to delete this record?")){
                    $q.when(genericService.delete('v2017', 'articles', article._id))
                    .then(function(data){
                        var index = $scope.articles.indexOf(article)
                        $scope.articles.splice(index, 1);
                    })
                }

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

                var query =  { $and : []};
                if(!search.titleContent && (search.tags||[]).length==0 && (search.customTags||[]).length==0 && (search.adminTags||[]).length==0)
                    query=undefined;

                if(search.titleContent && search.titleContent!=''){
                    query.$and.push({"$or" : [{"title.en": { "$$contains" : search.titleContent}}, 
                                              {"content.en": { "$$contains" : search.titleContent}}]});
                }

                if(search.tags && search.tags.length>0){
                   query.$and.push({"tags.title.en": {$in : _.map(search.tags, function(item){ return item.title.en })}});
                }
                if(search.customTags && search.customTags.length>0){
                    query.$and.push({"customTags.title.en": {$in : _.map(search.customTags, function(item){ return item.title.en })}});
                }
               
                if(search.adminTags){
                    var tags = _.split(search.adminTags, ' ');
                    for(var i=0; i < tags.length; i++){
                        query.$and.push({"adminTags.title.en": {"$$contains"  : tags[i] }});
                    }
                }

                console.log(query)
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
                    fields:{"_id":1,"title.en":1, "content.en":1, coverImage:1, 'meta.modifiedOn':1}
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


            $q.all([authentication.getUser(), genericService.query('v2017', 'articles', {count:1})])
                .then(function (results) {
                    var user = results[0];
                    if(~user.roles.indexOf('Administrator') || ~user.roles.indexOf('oasisArticleEditor'))
                        $scope.isAuthorizedForActions = true;
                    $scope.articlesCount = articlesCount = results[1].count;

                    $scope.updateScrollPage();
                });;
            
                
           
        }
    ]
});
