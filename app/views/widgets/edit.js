define(['app', 'vueFile!views/widgets/views/edit.vue', 'vuetify', 'views/workflows/vue-base-service', 'scbd-angularjs-services/authentication', 'angular-vue'], 
function(app, editComponent, Vuetify, vueBaseService){
    return ['$scope', 'apiToken', '$routeParams', function($scope, apiToken, $routeParams){        

        apiToken.get().then(function(token){
            $scope.hasAuthToken = true;     
            vueBaseService.setToken(token); 
        });

        $scope.widgetId = $routeParams.id||'new'
        $scope.vueOptions = {
            components:{
                editWidget:editComponent
            },
            vuetify : new Vuetify({                          
                        theme: {
                        light: false,
                        themes: {
                            light: {
                                primary: '#3b8dbc',
                                secondary: '#b0bec5',
                                accent: '#8c9eff',
                                error: '#b71c1c',
                            },
                        },
                    },
                })
        }


    }]
})
