define(['app', 'angular-vue',], function(app){
    return ['$scope', function($scope){        

        $scope.ngWorld  = "Angular";
        $scope.vueWorld = "Vue";
        $scope.alert = function(msg) {
            alert(msg)
        }
    }]
})
