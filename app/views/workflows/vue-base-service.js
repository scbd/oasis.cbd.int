define(['vue', 'axios', 'moment'], function(Vue, axios, moment){

    function utils(){
        
        var authorizationToken;

        init();

        return {

            setToken: function(token){
                authorizationToken = token
            },
            getToken: function(){
                return authorizationToken;
            }
        }

        function init(){
            console.log('init')

            axios.interceptors.request.use(function (config) {
                // Do something before request is sent
                config.headers               = config.headers || {};
                config.headers.accept        =  config.headers.accept || 'application/json',
                config.headers.Authorization =  config.headers.Authorization || 'Token ' + (authorizationToken||{}).token
                
                return config;
              }, function (error) {
                // Do something with request error
                return Promise.reject(error);
              });
            
        }
    }

    Vue.filter('formatDate', function(datetime, method, arg1, arg2, arg3) {
            return moment.utc(datetime)[method](arg1, arg2, arg3);
    })

    return  new utils();

})
