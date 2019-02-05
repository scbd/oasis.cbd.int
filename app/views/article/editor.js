
define(['app', 'ck-editor', 'text!views/article/editor-directive.html', 'lodash', 'angular-ui-select2', 'scbd-angularjs-services/locale',
 'scbd-angularjs-services/generic-service', 'scbd-angularjs-services/authentication', 
 'scbd-angularjs-services/storage', 'scbd-angularjs-filters', 'ng-file-upload'], 
 function (app, classicEditor, template, _) {
    

    app.directive('editor', ['$q', 'apiToken', '$http', 'IStorage',  function($q, apiToken, $http, storage){
        
        class UploadAdapter {
            constructor(loader) {
                this.loader = loader;
            }
            upload() {                 
                    var data = new FormData();
                    data.append('file', this.loader.file);

                    return $http.post('/api/v2015/temporary-files', data, {
                        headers: {'Content-Type': undefined}
                    })
                    .then(function(success) {
                            return success.data;
                    })
                    .catch(function(error) {  
                        console.log(error);                         
                        throw error;
                    });
            }
            abort() {
            }
        }
        
        return{
            restrict: 'EA',
            template : template,
            link: function ($scope, $element, $attrs) {                
                //available toolbar : code, 'emoji'
                var editorOptions = {
                    plugins1: [],
                    alignment: {
                        options: [ 'left', 'right' ]
                    },
                    highlight: {
                        options: [
                            {
                                model: 'greenMarker',
                                class: 'marker-green',
                                title: 'Green marker',
                                color: 'var(--ck-highlight-marker-green)',
                                type: 'marker'
                            },
                            {
                                model: 'redPen',
                                class: 'pen-red',
                                title: 'Red pen',
                                color: 'var(--ck-highlight-pen-red)',
                                type: 'pen'
                            }
                        ]
                    },
                    toolbar: [ 'heading', 'fontFamily', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', 'blockQuote', '|', 'alignment', 'highlight', 'insertTable', '|', 'imageUpload', 'mediaEmbed', '|', 'undo', 'redo' ],
                    image: {
                        toolbar : ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
                        styles  : ['full', 'alignLeft', 'alignRight']
                    }
                }
                classicEditor.create($element.find('#inline-editor')[0], editorOptions)
                .then(ed => {
                    // console.log(Array.from( ed.ui.componentFactory.names()))
                    ed.plugins.get('FileRepository').createUploadAdapter = (loader)=>{
                        return new UploadAdapter(loader);
                    };
                    $scope.editor = ed;
                    $scope.loadArticle();
                })
                .catch(error => {
                    console.error(error);
                });

            }
        }
    }])

    return ['$scope', '$http', 'IGenericService', '$q', '$route', '$http', 'apiToken',  '$location', 'locale', '$filter', 'Upload', '$timeout', '$window',
        function ($scope, $http, genericService, $q, $route, $http, apiToken, $location, locale, $filter, Upload, $timeout, $window) {
            $scope.articletags = [];
            $scope.articlecustomtags = [];
            $scope.articleadmintags = [];

            $scope.article = {
                tags        : [],
                customTags  : [],
                adminTags   : []
            }
            $scope.loadArticle = function(){
                if($route.current.$$route && $route.current.$$route.isNew)
                    $scope.document = {};
                else{
                    $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                    .then(function (data) {
                        $scope.document = data;
                        $scope.editor.setData(data.content.en)
                        $scope.article.tags         = _.map(data.tags,      function(t){ return {_id:t}});
                        $scope.article.customTags   = _.map(data.customTags,function(t){ return t});
                        $scope.article.adminTags    = _.map(data.adminTags, function(t){ return t});
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
                $scope.document.content = {
                    en: $scope.editor.getData()
                },
                $scope.document.tags        = _.map($scope.article.tags, "_id");
                $scope.document.customTags  = pluckTags($scope.article.customTags);
                $scope.document.adminTags   = pluckTags($scope.article.adminTags);

                //temp solution for media table
                updateHtml($scope.document.content, $scope.document.adminTags)
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

    }]
});
