define(['app', 'vueFile!views/widgets/edit.vue', 'angular-vue'], function(app, editComponent){
    return ['$scope', function($scope){        

        $scope.ngWorld  = "Angular";
        $scope.vueWorld = "Vue";
        $scope.alert = function(msg) {
            alert(msg)
        }

        $scope.$vueComponents = {
            blaBla:editComponent
        }

    }]
})
