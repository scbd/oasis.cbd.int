define(['app','ck-editor', 'text!./km-ckeditor.html','lodash','scbd-angularjs-services/authentication', 
'scbd-angularjs-services/storage'], 
function(app,classicEditor, template,lodash) {

	app.directive('ckEditor', ['$q', 'apiToken', '$http', 'IStorage', '$timeout',  function($q, apiToken, $http, storage, $timeout){
        
        class UploadAdapter {
            constructor(loader) {
                this.loader = loader;
            }
            upload() {
                return this.loader.file.then(function(file){
               
                    var data = new FormData();
                    data.append('file', file);

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

                })  
            }
            abort() {
            }
        }
        
        return{
            restrict: 'EA',
			template : template,
			require: "?ngModel",
			scope: {
				placeholder : '@',
				ngDisabledFn: '&ngDisabled',
				binding     : '=ngModel',
				locales     : '=',
				onInit    	: "&",
				onFileUpload: '&?',
				onPaste     : '&?'
			},
            link: function ($scope, $element, $attrs, ngModelController) {                
                
				$scope.editors = {};
				$scope.isUploadingFile = {};
				$timeout(function(){
					initializeEditor('en');
				}, 1500)

				$scope.onTabChange = function(lang){
					if(!$scope.editors[lang])
						initializeEditor(lang);
				}

				function initializeEditor(lang){
					//available toolbar : code, 'emoji'
					var editorOptions = {
						plugins: [],
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
						},
						heading: {
							options: [
								{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
								{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
								{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
								{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
							]
						},
						link: {
							addTargetToExternalLinks: true,
							decorators: [
								{
									mode: 'manual',
									label: 'Downloadable',
									attributes: {
										download: 'download'
									}
								}
							]
						}
					}
					if(lang=='ar')
						$element.find('#snippet-inline-editor_ar').attr('dir', 'rtl');
					
					classicEditor.create($element.find('#km-inline-editor_'+lang)[0], editorOptions)
					.then(function(ed){
						// console.log(Array.from( ed.ui.componentFactory.names()))

						$scope.editors[lang] = ed;
						if(!$scope.binding){
							$q.when($scope.onInit()).then(function(content){
								if(content)
									$scope.editors[lang].setData(content[lang]||'');
							});
						}
						else
							$scope.editors[lang].setData($scope.binding[lang]||'');

						ed.plugins.get('FileRepository').createUploadAdapter = function(loader){
							return new UploadAdapter(loader);
						};
						
						ed.editing.view.document.on('paste', function(eventInfo, data){
							console.log('paste', eventInfo, data)
						});

						ed.editing.view.document.on('drop', function(eventInfo, data){
							
							if(data.dataTransfer){

								$scope.isUploadingFile[lang] = true;
								var fileUploads = _.map(data.dataTransfer.files, function(file){
									

									var formData = new FormData();
									var file = data.dataTransfer.files[0];

									var fileType = file.type.substring( 0, 5 );
									var mimeType = storage.attachments.getMimeType(file);

									if(fileType == "image")
										return;

									formData.append('file', file);

									return $http.post('/api/v2015/temporary-files', formData, {
										headers: {'Content-Type': undefined}
									})
									.then(function(success) {
										var viewFragment = ed.data.processor.toView('&nbsp;<a target="_blank" href="'+success.data.url+'">'+success.data.metadata.fileName+ '</a>' );
										var modelFragment = ed.data.toModel(viewFragment);
										ed.model.insertContent( modelFragment);
									})

								});
								$q.all(fileUploads)
								.finally(function(){
									$scope.isUploadingFile[lang] = false
								});
							}
						});

						ed.model.document.on('change:data', function(eventInfo, data){
							if(!$scope.binding)
								$scope.binding = {};
							$scope.binding[lang] = ed.getData();
							ngModelController.$setViewValue($scope.binding);
						});
					})
					.catch(function(error){
						console.error(error);
					});
				}


				$scope.$on('$destroy', function(){
					_.each($scope.editor, function(editor){editor.destroy();})
				});

            }
        }
    }])
});
