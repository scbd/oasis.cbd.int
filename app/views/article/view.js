import app from '~/app';
import cssEscape from 'services/css.escape';
import '~/components/scbd-angularjs-services/main';
import 'ck-editor-content-css';
    
export { default as template } from './view.html';
    export default ['$scope', 'IGenericService', '$q', '$route', '$rootScope', '$timeout', '$http', '$location',
        function ($scope, genericService, $q, $route, $rootScope, $timeout, $http, $location) {
            $scope.baseUrl = window.baseUrl;
            $scope.locales = ['en','ar','es','fr','ru','zh'];
            $scope.activeLocale = 'en';

            user = $rootScope.user;
            $scope.canEdit = ~user.roles.indexOf('Administrator') || ~user.roles.indexOf('oasisArticleEditor');
            var editor;
            $q.when(genericService.get('v2017', 'articles', $route.current.params.id))
                .then(function (data) {
                    
                    data.tags = _.map(data.tags, function(t){ return {_id:t}});
                    data.customTags = _.map(data.customTags, function(t){return {_id:t}});

                    $scope.article = data;

                    $timeout(function(){
                        var getLocation = function(href) {
                            var l = document.createElement("a");
                            l.href = href;
                            return l;
                        };
                        function parseQuery(queryString) {
                            var query = {};
                            var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
                            for (var i = 0; i < pairs.length; i++) {
                                var pair = pairs[i].split('=');
                                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
                            }
                            return query;
                        }

                        document.querySelectorAll( 'oembed[url]' ).forEach( element => {
                            var url = element.attributes.url.value;
                            // var urlDetails = getLocation(url);
                            // var qs = parseQuery(urlDetails.search);
                            var params = {
                                url : encodeURI(url),
                                // maxheight:qs.height||qs.maxheight||'450',
                                // maxwidth:qs.width||qs.maxwidth||'100%'
                            }
                            $http.get('/api/v2020/oembed', {params:params})
                            .then(function(response){
                                var embedHtml = '<div class="ck-media__wrapper" style="width:100%">' + response.data.html +'</div>'
                                element.insertAdjacentHTML("afterend", embedHtml);
                            })
                        });

                    }, 200)

                    
            });            

            $scope.changeLocale = function(locale){
                $scope.activeLocale=locale
            }
            $scope.getSizedImage = function(url, size){
                // return url;

                return url && url
                .replace(/attachments.cbd.int\//, '$&'+size+'/')
                .replace(/\.s3-website-us-east-1\.amazonaws\.com\//, '$&'+size+'/')
            }

            $scope.close = function(){
                var search = $location.search()
                if(search.returnUrl)
                    $window.location = search.returnUrl;
                else    
                    $location.path('/articles')
            }
            $scope.cssEscape = cssEscape
        }
    ]

