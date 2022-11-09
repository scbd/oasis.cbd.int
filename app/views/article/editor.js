
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
            $scope.fieldTypes = [
                {type:'string', val:'String'}, {type:'number', val:'Number'},
                {type:'boolean', val:'Boolean'}, {type:'datetime', val:'Datetime'} 
            ]
            $scope.loading = true;
            $scope.showTranslationAlert = false;

            $scope.article = {
                tags        : [],
                customTags  : [],
                adminTags   : [],
                customProperties   : [{}]
            }


            $scope.loadArticle = function(){
                if($route.current.$$route && $route.current.$$route.isNew){
                    $scope.document = {};
                    originalDocument = {};
                    var query = $location.search();
                    $scope.article.tags = readQsTags(query.tags).map(function(tag){return {_id:tag}});
                    $scope.article.customTags = readQsTags(query.customTags).map(function(tag){return {_id:tag}});
                    $scope.article.adminTags = readQsTags(query.adminTags).map(function(tag){return {title:tag}});
                }
                else{                    
                    return $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                    .then(function (data) {
                        $scope.document = data;
                        $scope.article.tags         = _.map(data.tags,      function(t){ return {_id:t}});
                        $scope.article.customTags   = _.map(data.customTags,function(t){ return t});
                        $scope.article.adminTags    = _.map(data.adminTags, function(t){ return {title:t}});

                        if(!_.isEmpty(data.customProperties)){
                            $scope.article.customProperties = [];
                            _.forEach(data.customProperties, function(value, key){
                                var typeofValue = typeof value;                                
                                var property = {
                                    field : key,
                                    value : value,
                                    type: typeof value
                                }
                                if(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/.test(property.value))
                                    property.type = 'datetime';
                                else if(_.isBoolean(property.value))
                                    property.type = 'boolean';
                                else if(_.isNumber(property.value))
                                    property.type = 'number';
                                $scope.article.customProperties.push(property)
                            })
                            $scope.addCustomPropertiesRow();
                        }

                        $timeout(function(){
                            originalDocument = angular.copy($scope.document);
                        }, 200)
                    });
                }
            }

            $scope.asyncTags = function (query) {

                if(!query || query == ''){
                    return;
                }
                var queryParam = {"title.en" : { "$$startsWith" : query }};
                genericService.query('v2017', 'article-tags', {query:queryParam, pageNumber:0, pageLength:100, fields:{"title.en":1}})
                .then(function (response) {
                    $scope.articleTags = [];
                
                    var hasExactMatch = _.find(response, function(item){return item.title.en == query});
                    if(!hasExactMatch)
                        $scope.articleTags.push({title: { en : query }, isTag:true});

                    for(var i=0;i<response.length; i++){
                        var tag =  response[i];
                        if(!_.some($scope.article.tags, function(eTag){return eTag == tag._id})){
                            $scope.articleTags.push({_id:tag._id, title: tag.title});
                        }
                    }
                },
                function (err) {
                    console.log('ERROR!!!', err);
                }
              );
            }

            $scope.asyncCustomTags = function (query) {

                if(!query || query == ''){
                    return;
                }
                var queryParam = {"title.en" : { "$$startsWith" : query }};
                genericService.query('v2017', 'article-custom-tags', {query:queryParam, pageNumber:0, pageLength:100, fields:{"title.en":1}})
                .then(function (response) {
                    $scope.articleCustomTags = [];
                
                    var hasExactMatch = _.find(response, function(item){return item.title.en == query});
                    if(!hasExactMatch)
                        $scope.articleCustomTags.push({title: { en : query }, isTag:true});

                    for(var i=0;i<response.length; i++){
                        var tag =  response[i];
                        if(!_.some($scope.article.customTags, function(eTag){return eTag == tag._id})){
                            $scope.articleCustomTags.push({_id:tag._id, title: tag.title});
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
                    
                    var hasExactMatch = _.find(response, {title:query})
                    if(!hasExactMatch)
                        $scope.articleAdminTags.push({title:query, isTag:true});

                    for(var i=0;i<response.length; i++){
                        var tag =  response[i];             
                        if(!_.some($scope.article.adminTags, function(eTag){return eTag == tag._id})){
                            $scope.articleAdminTags.push(tag);
                        }
                    }
                },
                function (err) {
                    console.log('ERROR!!!', err);
                }
              );
            }

            $scope.submit = function (close) {

                function pluckTags(tags){
                    return _.compact(_.map(tags, function(t){
                        if(t._id)                       return t._id;
                        else if(typeof t == 'string')   return t;
                        else if(t.isTag)                return t.title;
                    }));
                }

                if(!validateCustomProperties())
                    return

                var newDocument             = _.cloneDeep($scope.document)
                newDocument.tags            = _.map($scope.article.tags, "_id");
                newDocument.customTags      = pluckTags($scope.article.customTags);
                newDocument.adminTags       = _($scope.article.adminTags).map('title').compact().uniq().value();

                newDocument.customProperties= {};
                _.each($scope.article.customProperties, function(data){
                    if(data.type && data.field && data.value){
                        newDocument.customProperties[data.field] = data.value
                    }
                });
                
                delete newDocument.tagsInfo;
                delete newDocument.customTagsInfo;
                newDocument = sanitizeDocument(newDocument); 
                var operation;
                if(newDocument && newDocument._id){
                    operation = genericService.update('v2017', 'articles',newDocument._id, newDocument);
                }
                else{
                    operation = genericService.create('v2017', 'articles', newDocument);
                }

                $scope.errors = undefined;
                $scope.loading = true;
                $scope.loadingText = 'saving'
                $q.when(operation)
                .then(function(result){
                    if(close){
                        $scope.close();
                    }
                    if(!newDocument._id && result.id){
                        $location.path('articles/'+result.id+'/edit')  
                        var returnUrl = $location.search().returnUrl                        
                        $location.search('returnUrl', returnUrl);
                    }
                })
                .catch(function(e){
                    $scope.errors = e.data||e
                })
                .finally(function(){
                    $scope.loading = false;
                    $scope.loadingText = '';
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
            
            $scope.tagCustomTransform = function (newTag) {
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

            $scope.addCustomPropertiesRow = function(){
                var customProperties = $scope.article.customProperties;
                var lastRow = customProperties[customProperties.length-1]
                if(!customProperties){
                    $scope.article.customProperties = [{}];
                }

                if(lastRow.type || lastRow.field || lastRow.value)
                    $scope.article.customProperties.push({});

                validateCustomProperties();
            }

            $scope.removeRow = function(data){
                var index = $scope.article.customProperties.indexOf(data);
                $scope.article.customProperties.splice(index, 1);
            }

            $scope.close = function(){
                var search = $location.search()
                if(search.returnUrl)
                    $window.location = search.returnUrl;
                else    
                    $location.path('/articles')
            }

            function validateCustomProperties(){
                var isValid = true;
                var customProperties = $scope.article.customProperties;
                var lastRow = customProperties[customProperties.length-1];
                _.each(customProperties, function(data){

                    if(data == lastRow && (!lastRow.type && !lastRow.field && !lastRow.value))
                       return;

                    data.typeMissing = !data.type;
                    data.typeMissing = data.typeMissing || undefined;

                    data.fieldMissing = !data.field;
                    data.fieldMissing = data.fieldMissing || undefined;

                    if(!data.fieldMissing){
                        if(!/^[a-z][a-z0-9]{0,31}$/i.test(data.field)){
                            data.fieldNameInvalid = true
                        }
                        else data.fieldNameInvalid = undefined;
                    }

                    data.valueMissing = !data.value;
                    data.valueMissing = data.valueMissing || undefined;

                    isValid = isValid || data.typeMissing || data.fieldMissing || data.fieldNameInvalid ||
                              data.valueMissing
                })
                return isValid;
            }
            function hasLangString(element){
                return element && (element.hasOwnProperty('ar') ||
                        element.hasOwnProperty('fr') || element.hasOwnProperty('es') || 
                        element.hasOwnProperty('ru') || element.hasOwnProperty('zh'));
            }

            function readQsTags(qsValue){
               return _(_.isArray(qsValue) ? qsValue       : (qsValue      ||'').split(',')).compact().value()
            }


            function sanitizeDocument(document){

                if(!document) return;
        
                document = sanitize(document);

                return document;
        
                function sanitize(doc){
                    _.forEach(doc, function(fieldValue, key){
                        
                        if(_.isString(fieldValue) && _.trim(fieldValue||'') == ''){
                        fieldValue = undefined;
                        }
                        else if(_.isArray(fieldValue)){
                            fieldValue = sanitize(fieldValue);
                            fieldValue = _.compact(fieldValue);
                        
                        if(_.isEmpty(fieldValue))
                            fieldValue = undefined;
                        }
                        else if(_.isPlainObject(fieldValue)){
                            fieldValue = sanitize(fieldValue);
                            fieldValue = _.omitBy(fieldValue, isNullOrUndefinedOrEmpty);
                        }
                        if(!fieldValue)
                            delete doc[key]
                        else
                            doc[key] = fieldValue;
            
                    });
                
                    if(_.isArray(doc))
                        doc = _.compact(doc)
                    else if(_.isPlainObject(doc))
                        doc = _.omitBy(doc, isNullOrUndefinedOrEmpty);
                    
                    return doc;
                }
                
            }
            function isNullOrUndefinedOrEmpty(v){
                return v === undefined || v === null || (_.isObject(v) && _.isEmpty(v));
            }
    }]
});
