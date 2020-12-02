define(['app', 'vueFile!views/widgets/edit.vue', 'angular-vue'], function(app, editComponent){
    return ['$scope', function($scope){        

        $scope.$vueComponents = {
            editWidget:editComponent
        }

    }]
})
