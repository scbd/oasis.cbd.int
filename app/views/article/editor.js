
define(['app', 'lodash', 'angular-ui-select2', 'scbd-angularjs-services/locale',
 'scbd-angularjs-services/generic-service', 'scbd-angularjs-services/authentication', 
 'components/scbd-angularjs-controls/form-control-directives/km-ckeditor', 
 'components/scbd-angularjs-controls/form-control-directives/km-inputtext-ml',
 'scbd-angularjs-services/storage', 'scbd-angularjs-filters', 'ng-file-upload'], 
 function (app, _) {
    
    return ['$scope', '$http', 'IGenericService', '$q', '$route', '$http', 'apiToken',  '$location', 'locale', '$filter', 'Upload', '$timeout', '$window',
        function ($scope, $http, genericService, $q, $route, $http, apiToken, $location, locale, $filter, Upload, $timeout, $window) {
            var originalDocument;
            $scope.document = {};
            $scope.locales = ['en','ar','es','fr','ru','zh'];

            $scope.articletags = [];
            $scope.articlecustomtags = [];
            $scope.articleadmintags = [];
            $scope.loading = true;
            $scope.showTranslationAlert = false;

            $scope.article = {
                tags        : [],
                customTags  : [],
                adminTags   : []
            }


            $scope.loadArticle = function(){
                if($route.current.$$route && $route.current.$$route.isNew){
                    $scope.document = {};
                    originalDocument = {};
                }
                else{                    
                    return $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                    .then(function (data) {
                        $scope.document = data;
                        $scope.article.tags         = _.map(data.tags,      function(t){ return {_id:t}});
                        $scope.article.customTags   = _.map(data.customTags,function(t){ return t});
                        $scope.article.adminTags    = _.map(data.adminTags, function(t){ return t});

                        $timeout(function(){
                            originalDocument = angular.copy($scope.document);
                        }, 200)
                    });
                }
            }

            $scope.funcAsync = function (schema, query, table) {
                var tableName = table || schema.replace(/-/g, '')
                if(!query || query == ''){
                    // $scope[tableName].length = 0;
                    return;
                }
                // if($scope.customTags.length>0)
                //     return;
                var queryParam = {"title.en" : { "$$startsWith" : query }};
                genericService.query('v2017', schema, {query:queryParam, pageNumber:0, pageLength:100, fields:{"title.en":1}})
                .then(function (response) {
                    $scope[tableName].length = 0;
                
                    for(var i=0;i<response.length; i++){
                        var tag =  response[i];
                        var recordsToVerify = [];
                        if(tableName == 'articlecustomtags')
                            recordsToVerify = $scope.article.customTags;
                        if(tableName == 'admintags')
                            recordsToVerify = $scope.article.adminTags;
                        else
                            recordsToVerify = $scope.article.tags;
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

            $scope.submit = function () {

                function pluckTags(tags){
                    return _.compact(_.map(tags, function(t){
                        if(t._id)                       return t._id;
                        else if(typeof t == 'string')   return t;
                        else if(t.isTag)                return t.title;
                    }));
                }

                $scope.document.tags        = _.map($scope.article.tags, "_id");
                $scope.document.customTags  = pluckTags($scope.article.customTags);
                $scope.document.adminTags   = pluckTags($scope.article.adminTags);

                //temp solution for media table
                updateHtml($scope.document.content, $scope.document.adminTags)
                // //another special case for 
                // if($scope.document._id == '5c992c30f2fd9c0001d8d3c1'){

                // }
                var operation;
                if($scope.document && $scope.document._id){
                    operation = genericService.update('v2017', 'articles',$scope.document._id, $scope.document);
                }
                else{
                    operation = genericService.create('v2017', 'articles', $scope.document);
                }
                $q.when(operation)
                .then(function(result){
                    var search = $location.search()
                    if(search.returnUrl)
                        $window.location = search.returnUrl;
                    else    
                        $location.path('/articles')
                })
                // 
            }

            ////tags from third party
            $scope.getTags = function () {
                $scope.tags = [];
                $q.when($http.post('api/v2017/articles/tags',{ data: $scope.document.content}))
                .then(function(data){
                    $scope.tags = data.data;
                });
                
            }
            
            $scope.getTerm = function(term){

                if(term.title)
                    return term.title.en;

                var searchTerm = {
                    _id : term
                }
                if(term._id)
                    searchTerm._id = term._id;

                var result = $filter('tagTerm')(searchTerm, 'article-custom-tags')
                // console.log(result, term)
                return result;
            }

            $scope.tagTransform = function (newTag) {
                var item = {
                    title: { en : newTag}
                };
            
                return item;
            };
            $scope.$watch('coverImage', function (newVal) {
                if(newVal)
                    $scope.upload([newVal]);
            });
        
            $scope.upload = function (files) {
                if (files && files.length) {                   

                    for (var i = 0; i < files.length; i++) {
                      var file = files[i];
                      if (!file.$error) {
                          $scope.coverImageProgress = {value:0}
                            Upload.upload({
                                url: '/api/v2015/temporary-files',
                                data: {
                                    file: file  
                                }
                            }).then(function (resp) {
                                $timeout(function() {
                                    if(!$scope.document.coverImage)
                                        $scope.document.coverImage = {};
                                    $scope.document.coverImage.url = undefined;
                                    $scope.document.coverImage.url = resp.data.default;
                                    $scope.coverImageProgress = undefined;
                                    $scope.onEditorFileUpload(resp.data)
                                });
                            }, null, function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total)-5;
                                $scope.coverImageProgress.value = progressPercentage;
                            });
                        }
                    }
                }
            }

            $scope.onEditorInitialized = function(){
                return $q.when($scope.loadArticle())
                .then(function(){
                    return ($scope.document||{}).content;
                })
                .finally(function(){$scope.loading =false});
            }

            $scope.getSizedImage = function(url, size){
                return url && url
                .replace(/attachments.cbd.int\//, '$&'+size+'/')
                .replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
            }

            $scope.showTranslationMessage = function(){
                if(!originalDocument || $scope.showTranslationAlert)
                    return;

                if(!hasLangString($scope.document.title) && !hasLangString($scope.document.content))
                    return;

                if((originalDocument.title && originalDocument.title.en != $scope.document.title.en) ||
                    originalDocument.content && originalDocument.content.en != $scope.document.content.en)
                    $scope.showTranslationAlert = true;
            }

            $scope.onEditorFileUpload = function(data){
                // console.log(data)
                $scope.document.attachments = $scope.document.attachments||[];
                $scope.document.attachments.push(data)

            }

            function updateHtml (content, tags){

                // if(_.contains(tags, 'media')){

                    _.each(content, function(lang, key){
                        if(lang.indexOf('<td><strong>Date</strong></td>')>=0 && lang.indexOf('<td><strong>Time</strong></td>')>=0){
                           content[key] =  lang.replace('<table>', '<table class="table table-responsive">')
                            .replace('<td><strong>Date</strong></td>', '<td width="10%"><strong>Date</strong></td>')
                            .replace('<td><strong>Time</strong></td>', '<td width=\"15%\"><strong>Time</strong></td>');
                        }
                    })

                // }
            }

            function hasLangString(element){
                return element && (element.hasOwnProperty('ar') ||
                        element.hasOwnProperty('fr') || element.hasOwnProperty('es') || 
                        element.hasOwnProperty('ru') || element.hasOwnProperty('zh'));
            }
    }]
});
