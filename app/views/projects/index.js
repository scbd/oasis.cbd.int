define(['app'
    ], function (app) {
    return ['$scope', '$http', '$q',
    function ($scope, $http, $q) {
          $q.when($http.get('https://api.github.com/orgs/scbd/repos?per_page=100'))
          .then(function(result){
              console.log(result.data);
              $scope.projects = result.data;
          })
    }];
});
