import app from '~/app';
import classicEditor from 'ck-editor';
import '~/components/scbd-angularjs-services/main';
   
export { default as template } from './view.html';
    export default ['$scope', '$http', 'IGenericService', '$q', '$route', '$timeout', '$location',
        function ($scope, $http, genericService, $q, $route, $timeout, $location) {
            
            var editor;
            $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                .then(function (data) {
                    
                    data.tags = _.map(data.tags, function(t){ return {_id:t}});
                    data.customTags = _.map(data.customTags, function(t){return {_id:t}});

                    $scope.article = data;
                    var editorOptions = {
                        toolbar: ['Source'],                        
                        image: {
                            styles: [
                                'imageStyleFull',
                                'imageStyleAlignLeft',
                                'imageStyleAlignRight'
                            ]
                        },
                        isReadOnly:true
                    }

                    $timeout(function(){
                        classicEditor.create(document.querySelector('#editor'), editorOptions).then(ed => {
                            editor = ed;
                            editor.isReadOnly=true
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    }, 10)
            });;
            
            $scope.edit = function(id){
                $location.path('/articles/' + id + '/edit');
            }

            $scope.$on('$destroy', function(){
                editor.destroy();
            });

            $scope.getSizedImage = function(url, size){
                // return url;

                return url.replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
            }
        }
    ]

