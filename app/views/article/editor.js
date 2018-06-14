
define(['app', 'ck-editor', 'text!views/article/editor-directive.html', 'lodash', 'angular-ui-select2', 'scbd-angularjs-services/locale',
 'scbd-angularjs-services/generic-service', 'scbd-angularjs-services/authentication', 'scbd-angularjs-filters', 'ng-file-upload'], 
 function (app, classicEditor, template, _) {
    
    app.directive('editor', ['$q', 'apiToken', function($q, apiToken){
        return{
            restrict: 'EA',
            template : template,
            link: function ($scope, $element, $attrs) {
                var editor;
                $q.when(apiToken.get())
                .then(function(token){
                    //available toolbar : code, 'emoji'
                    var editorOptions = {
                        plugins1: [],
                        toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
                        cloudServices: {
                            uploadUrl : '/api/v2015/temporary-files',
                            token: 'Ticket '+token.token,
                            tokenUrl1: 'Ticket '+token.token
                        },
                        image: {
                            toolbar: ['imageTextAlternative', '|', 'imageStyleAlignLeft', 'imageStyleFull', 'imageStyleAlignRight'],
                            styles: [
                                'imageStyleFull',
                                'imageStyleAlignLeft',
                                'imageStyleAlignRight'
                            ]
                        }
                    }
                    classicEditor.create($element.find('#inline-editor')[0], editorOptions)
                    .then(ed => {
                        console.log(ed);
                        $scope.editor = ed;
                        $scope.loadArticle();
                    })
                    .catch(error => {
                        console.error(error);
                    });
                })

            }
        }
    }])

    return ['$scope', '$http', 'IGenericService', '$q', '$route', '$http', 'apiToken',  '$location', 'locale', '$filter', 'Upload', '$timeout',
        function ($scope, $http, genericService, $q, $route, $http, apiToken, $location, locale, $filter, Upload, $timeout) {
            $scope.articletags = [];
            $scope.articlecustomtags = [];

            $scope.article = {
                tags : [],
                customTags : [],
                mCustomTags : []
            }
            $scope.loadArticle = function(){
                if($route.current.$$route && $route.current.$$route.isNew)
                    $scope.document = {};
                else{
                    $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                    .then(function (data) {
                        $scope.document = data;
                        $scope.editor.setData(data.content.en)
                        $scope.article.tags = _.map(data.tags, function(t){ return {_id:t}});
                        $scope.article.customTags = _.map(data.customTags, function(t){ return t});
                        $scope.article.mCustomTags = _.map(data.customTags, function(t){ return t});
                    });
                }
            }

            $scope.funcAsync = function (schema, query) {
                var tableName = schema.replace(/-/g, '')
                if(!query || query == ''){
                    // $scope[tableName].length = 0;
                    return;
                }
                // if($scope.customTags.length>0)
                //     return;
                var queryParam = {"title.en" : query };
                genericService.query('v2017', schema+'/search', {query:queryParam, pageNumber:0, pageLength:100, fields:{"title.en":1}})
                .then(function (response) {
                    $scope[tableName].length = 0;
                
                    for(var i=0;i<response.length; i++){
                        var tag =  response[i];
                        var recordsToVerify = [];
                        if(tableName == 'articlecustomtags')
                            recordsToVerify = $scope.article.customTags;
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
                $scope.document.content = {
                    en: $scope.editor.getData()
                },
                $scope.document.tags = _.pluck($scope.article.tags, "_id");
                $scope.document.customTags = _.compact(_.map($scope.article.customTags, function(t){
                                                if(t._id)                       return t._id;
                                                else if(typeof t == 'string')   return t;
                                                else if(t.isTag)                return t.title;
                                            }));

                // return;
                var operation;
                if($scope.document && $scope.document._id){
                    operation = genericService.update('v2017', 'articles',$scope.document._id, $scope.document);
                }
                else{
                    operation = genericService.create('v2017', 'articles', $scope.document);
                }
                $q.when(operation)
                .then(function(result){
                    $location.path('/articles')
                })
                // 
            }

            $scope.getTags = function () {
                $scope.tags = [];
                $q.when($http.post('api/v2017/articles/tags',{ data: editor.getData()}))
                .then(function(data){
                    $scope.tags = data.data;
                });
                
            }

            $scope.$on('$destroy', function(){
                $scope.editor.destroy();
            });
            
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
                    console.log(files.length)
                   

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
                                });
                            }, null, function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total)-5;
                                $scope.coverImageProgress.value = progressPercentage;
                            });
                        }
                    }
                }
            }

            $scope.getSizedImage = function(url, size){
                return url && url
                .replace(/attachments.cbd.int\//, '$&'+size+'/')
                .replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
            }
    }]
});
