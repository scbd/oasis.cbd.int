import app from 'app';
    export default ['$scope', '$http', '$q',
    function ($scope, $http, $q) {

        $scope.baseUrl = window.baseUrl;
          $q.when($http.get('https://api.github.com/orgs/scbd/repos?per_page=100'))
          .then(function(result){
              $scope.projects = result.data;
          })
    }];

