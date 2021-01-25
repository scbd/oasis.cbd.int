define(['app', 'vue', 'vuetify', './vue-base-service', 'scbd-angularjs-services/authentication'], function(app, Vue, Vuetify, vueBaseService){
    // Create angular module + directive wrapper
    app.directive('vueWrapper', ['apiToken', '$q', function(apiToken, $q) {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                scope.vueValue = {};

               apiToken.get().then(function(token){                    
                    vueBaseService.setToken(token)

                    // Our Vue root instance
                    var vue = new Vue({
                        el: elem[0].querySelector('[ng-non-bindable]'),
                        vuetify: new Vuetify({                          
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
                        }),
                        data: {
                            vueValue: scope.vueValue
                        },
                        methods: {
                            updatevaluefromvue: function(val) {
                                scope.$apply(function() {
                                    scope.vueValue = val;
                                });
                            }
                        },
                        created(){
                            // console.log(vueBaseService.getToken())
                        }
                    });
                })
                
                    
                // Send updates from angular to vue component
                scope.sendUpdatesToVue = function(val) {
                    vue.vueValue = val;
                }
            }
        }
    }]);

})
