define(['app', 'vueFile!views/widgets/views/list.vue', 'vuetify', 'views/workflows/vue-base-service', 'scbd-angularjs-services/authentication', 'angular-vue'], 
function(app, listComponent, Vuetify, vueBaseService){
    return ['$scope', 'apiToken', '$routeParams', function($scope, apiToken, $routeParams){        

        apiToken.get().then(function(token){
            $scope.hasAuthToken = true;     
            vueBaseService.setToken(token); 
        });

        $scope.widgetId = $routeParams.id
        $scope.vueOptions = {
            components:{
                listWidget:listComponent
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
