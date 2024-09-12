import app from '~/app';
import classicEditor from 'ck-editor';
import template from './km-ckeditor.html';
import _ from 'lodash';
import '~/components/scbd-angularjs-services/main';

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
					//available toolbar : code, 'emoji', 'htmlEmbed',plugins1: [],
					
					var editorOptions = {
						
						toolbar: [ 	
							'heading','fontSize', 'fontColor', '|', 
							'bold', 'italic', 'link', '|', 
							'indent', 'outdent','alignment', '|',
							'bulletedList', 'numberedList', 'blockQuote', '|', 
							'highlight', 'insertTable', '|', 
							'imageInsert', 'mediaEmbed', '|', 
							'horizontalLine', '|',
							'removeFormat', 'undo', 'redo', '|', 'pageBreak', 'brBreak'
						],
						alignment: {
							options: [ 'left', 'right', 'center', 'justify']
						},
						list: {
							properties: {
								styles: true,
								startIndex: true,
								reversed: true
							}
						},
						image: {
							styles: [
								'alignCenter',
								'alignLeft',
								'alignRight'
							],
							resizeOptions: [
								{ name: 'imageResize:original', label: 'Original', value: null },
								{ name: 'imageResize:25', label: '25%', value: '25' },
								{ name: 'imageResize:50', label: '50%', value: '50' },
								{ name: 'imageResize:75', label: '75%', value: '75' }
							],
							toolbar: [
								'imageTextAlternative', 'toggleImageCaption', '|',
								'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
								'resizeImage'
							],
							insert: {
								integrations: [
									'insertImageViaUrl'
								]
							}
						},
						heading: {
							options: [
								{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
								{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
								{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
								{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
							]
						},
						fontSize: {
							options: [8, 10, 12, 14, 'default', 18, 20, 22 ],
							supportAllValues: true
						},
						table: {
							contentToolbar: [
								'tableColumn', 'tableRow', 'mergeTableCells',
								'tableProperties', 'tableCellProperties', 'toggleTableCaption'
							],
				
						},
						link: {
							addTargetToExternalLinks: false,
							defaultProtocol: 'https://',
							decorators: [
								{
									mode: 'manual',
									label: 'Downloadable',
									attributes: {
										download: 'download'
									}
								},
								{
									mode: 'manual',
									label: 'Open in a new tab',
									attributes: {
										target: '_blank',
										rel: 'noopener noreferrer'
									}
								}
							]
						},
						wordCount: {
							onUpdate:function(stats){
								$scope.wordCount = stats.words;
							}
						},
						mediaEmbed:{
							// previewsInData: false,
							// removeProviders :['youtube'],
							providers: [
							{
								name: 'youtubePlaylist',
								url: [
									/^youtube\.com\/embed\/videoseries\?list=([\w-]+)/,
								],
								html: function(match){
									const id = match[ 1 ];

									return (
										'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
											`<iframe src="https://www.youtube.com/embed/videoseries?list=${ id }" ` +
												'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
												'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
											'</iframe>' +
										'</div>'
									);
								}
							},
							{
								name: 'youtube',
								url: [
									/^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)/,
									/^(?:m\.)?youtube\.com\/v\/([\w-]+)/,
									/^youtube\.com\/embed\/([\w-]+)/,
									/^youtu\.be\/([\w-]+)/
								],
								html: function(match){
									const id = match[ 1 ];

									return (
										'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
											`<iframe src="https://www.youtube.com/embed/${ id }" ` +
												'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
												'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
											'</iframe>' +
										'</div>'
									);
								}
							},
							{
								name: 'customEmbed',
								url: [
									/cdn\.knightlab\.com\/libs\/timeline3\/.*/,
									/uploads\.knightlab\.com\/storymapjs\/.*/,
									/cdn\.knightlab\.com\/libs\/juxtapose\/.*/,
									/uploads\.knightlab\.com\/scenevr\/.*/,
									/cdn\.knightlab\.com\/libs\/storyline\/.*/,
									/theydrawit\.mucollective\.co\/vis\/.*/,
									/youtube\.com\/embed\/videoseries.*/,
									/app\.tango\.us\/app\/workflow\/.*/,
									/docs\.google\.com\/document\/d\/.*/,
									/(.*\.)?cbd\.int\/.*/,
									
								],
								html: function(id){
									return '<figure class="media">' +
										   '	<oembed url="' + id.input + '">' + 
										   			'<a href="' + id.input + '">' + id.input + '</a>' +
										   '	</oembed>' +
											'</figure>'
								}
							}
							]
						}
					}
					
					classicEditor.create($element.find('#km-inline-editor_'+lang)[0], editorOptions)
					.then(function(ed){
						// console.log(Array.from( ed.ui.componentFactory.names()))
						if(lang=='ar'){
							$element.find('#snippet-inline-editor_ar .ck-editor__editable').attr('dir', 'rtl');
						}
						$scope.editors[lang] = ed;
						
						if(!$scope.binding){
							$q.when($scope.onInit()).then(function(content){

								$scope.binding = $scope.binding || {};

								if(content) {

									Object.keys(content).forEach(function(l) {
										$scope.binding[l] = content[l];
									})
									
									$scope.editors[lang].setData(content[lang]||'');
								}
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

