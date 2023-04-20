
import angular from "angular-flex";
import 'angular-sanitize';
import 'angular-ui-select2';
import 'ng-file-upload';
import { AngularVuePlugin, CreateAngularVuePlainPlugin, AngularVueRoutePlugin, 
    AngularVueRouterPlugin, AngularVueAuthPlugin, AngularVueDirective } from 'angular-vue';

var dependencies = ['ngRoute', 'ngCookies', 'ngSanitize', 'ckeditor','ui.select','ngFileUpload', 'angularGrid', 'angularVue', 'ngStorage', 'toast', 'ng-breadcrumbs'];

angular.defineModules(dependencies);
var app = angular.module('app', dependencies);



app.directive('ngVue', AngularVueDirective);
app.run(["locale", '$injector', 'authentication', '$location', function (locale, $injector, authentication, $location) {

  registerVuePlugin('$locale', locale);
  registerVuePlugin('$accountsBaseUrl', authentication.accountsBaseUrl())

    const vueRootApp = new Vue({});
  window.Vue.use(new AngularVuePlugin({ $injector, ngApp: app, vueApp: vueRootApp }));
  window.Vue.use(new AngularVueRoutePlugin ());
  window.Vue.use(new AngularVueRouterPlugin());
  window.Vue.use(new AngularVueAuthPlugin({
    fetchUser() { return authentication.getUser(); },
    logout() { authentication.signOut(); },
    async login() {
      console.log("$auth: force sign in");

      const { $route, $router, $ngVue } = Vue.prototype;
      const appConfigService = $ngVue.$injector.get('appConfigService')

      const { fullPath, query } = $route;
      let { returnUrl } = query;

      if (!returnUrl) returnUrl = fullPath;

      const path = appConfigService.getSiteMapUrls().user.signIn

      $router.push({ path, query: {...query, returnUrl }, hash: null });
    }
  }));
    
}]);
  
function registerVuePlugin(name, service){
  const newPlugin = new CreateAngularVuePlainPlugin(name, service)
  window.Vue.use(newPlugin);
}

export default app;
    
