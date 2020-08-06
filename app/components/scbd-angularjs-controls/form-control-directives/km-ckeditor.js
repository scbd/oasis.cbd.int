define(['app','ck-editor', 'text!./km-ckeditor.html','lodash','scbd-angularjs-services/authentication', 
'scbd-angularjs-services/storage'], 
function(app,classicEditor, template, _) {

	app.directive('ckEditor', ['$q', 'apiToken', '$http', 'IStorage', '$timeout',  function($q, apiToken, $http, storage, $timeout){
        
        class UploadAdapter {
            constructor(loader) {
                this.loader = loader;
            }
            upload() {
				var loader = this.loader;
                return this.loader.file.then(function(file){
               
                    var data = new FormData();
                    data.append('file', file);

                    return $http.post('/api/v2015/temporary-files', data, {
						headers: {'Content-Type': undefined}
                    })
                    .then(function(success) {
						loader.uploaded = success.data;						
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
					//available toolbar : code, 'emoji',plugins1: [],
						
					var editorOptions = {
						
						toolbar: [ 	
							'heading', 'fontFamily', , 'fontSize', 'fontColor', '|', 
							'bold', 'italic', 'link', '|', 
							'indent', 'outdent','alignment', '|',
							'bulletedList', 'numberedList', 'blockQuote', '|', 
							'highlight', 'insertTable', '|', 
							'imageUpload', 'mediaEmbed', '|', 
							'horizontalLine', '|',
							'removeFormat', 'undo', 'redo'
						],
						alignment: {
							options: [ 'left', 'right', 'center', 'justify']
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
						fontSize: {
							options: [
								9,
								11,
								13,
								'default',
								17,
								19,
								21,
								24,
								27,
								30,
								32
							]
						},
						fontColor: {
							colors: [
								{
									color: 'hsl(0, 0%, 0%)',
									label: 'Black'
								},
								{
									color: 'hsl(0, 0%, 30%)',
									label: 'Dim grey'
								},
								{
									color: 'hsl(0, 0%, 60%)',
									label: 'Grey'
								},
								{
									color: 'hsl(0, 0%, 90%)',
									label: 'Light grey'
								},
								{
									color: 'hsl(0, 0%, 100%)',
									label: 'White',
									hasBorder: true
								}
							]
						},
						image: {
							resizeOptions: [
								{ name: 'imageResize:original', label: 'Original', value: null },
								{ name: 'imageResize:25', label: '25%', value: '25' },
								{ name: 'imageResize:50', label: '50%', value: '50' },
								{ name: 'imageResize:75', label: '75%', value: '75' }
							],
							toolbar : [	'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight', '|', 'imageTextAlternative', 'linkImage', '|', 'imageResize'],
							styles  : ['full', 'side', 'alignLeft', 'alignCenter', 'alignRight']
						},
						heading: {
							options: [
								{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
								{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
								{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
								{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
							]
						},
						table: {
							contentToolbar: [
								'tableColumn', 'tableRow', 'mergeTableCells',
								'tableProperties', 'tableCellProperties'
							],
				
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
								},
								// {
								// 	mode: 'manual',
								// 	label: 'Open in a new tab',
								// 	attributes: {
								// 		target: '_blank',
								// 		rel: 'noopener noreferrer'
								// 	}
								// }
							]
						},
						wordCount: {
							onUpdate:function(stats){
								$scope.wordCount = stats.words;
							}
						},
						mediaEmbed:{
							previewsInData: false,
							extraProviders: [
							{
								name: 'customEmbed',
								url: [
									/cdn\.knightlab\.com\/libs\/timeline3\/.*/,
									/uploads\.knightlab\.com\/storymapjs\/.*/,
									/cdn\.knightlab\.com\/libs\/juxtapose\/.*/,
									/uploads\.knightlab\.com\/scenevr\/.*/,
									/cdn\.knightlab\.com\/libs\/storyline\/.*/,
									/theydrawit\.mucollective\.co\/vis\/.*/
								],
								html: function(id){
									return '<figure class="media">' +
										   '	<oembed url="' + id.input + '">' + 
										   			'<a href="' + id.input + '">' + id.input + '</a>'
										   '	</oembed>' +
											'</figure>'
								}
							}]
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
							var uploadAdapter = new UploadAdapter(loader);
							uploadAdapter.loader.on('change:uploaded' , onEditorImageUploaded);
							return uploadAdapter;
						};
						
						
						ed.editing.view.document.on('paste', function(eventInfo, data){
							// console.log('paste', eventInfo, data)
						});

						ed.editing.view.document.on('drop', function(eventInfo, data){
							
							if(data.dataTransfer){

								$scope.isUploadingFile[lang] = true;
								var fileUploads = _.map(data.dataTransfer.files, function(file, i){
									

									var formData = new FormData();
									var file = data.dataTransfer.files[i];

									var fileType = file.type.substring( 0, 5 );
									var mimeType = storage.attachments.getMimeType(file);

									if(fileType == "image")
										return;

									if (storage.attachments.mimeTypeWhitelist.indexOf(mimeType) < 0) {
										alert("File type not supported: " + mimeType + "(" + file.name + ")");
										return;
									}
									formData.append('file', file);

									return $http.post('/api/v2015/temporary-files', formData, {
										headers: {'Content-Type': undefined}
									})
									.then(function(success) {
										var viewFragment = ed.data.processor.toView('&nbsp;<a target="_blank" href="'+success.data.url+'">'+success.data.metadata.fileName+ '</a>' );
										var modelFragment = ed.data.toModel(viewFragment);
										ed.model.insertContent( modelFragment);
										$scope.onFileUpload({data:success.data});
									})

								});
								$q.all(fileUploads)
								.finally(function(){
									$scope.isUploadingFile[lang] = false
								});
							}
						});

						ed.model.document.on('change:data', function(eventInfo, data){
							var binding = angular.copy($scope.binding||{});
							binding[lang] = ed.getData();
							$scope.binding = binding;
							ngModelController.$setViewValue($scope.binding);
						});

						function onEditorImageUploaded(eventInfo, name, value, oldValue){
							if(value.url){
								$scope.onFileUpload({data:value})
							}
						}
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
