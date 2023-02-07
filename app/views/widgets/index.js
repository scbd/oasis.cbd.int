import app from '~/app';
import listComponent from './views/list.vue';
import Vuetify from 'vuetify';
import vueBaseService from '~/views/workflows/vue-base-service';
import '~/components/scbd-angularjs-services/main';
import 'angular-vue';


export { default as template } from './index.html';
    export default ['$scope', 'apiToken', '$routeParams', function($scope, apiToken, $routeParams){        

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

