import app from '~/app';
import _ from 'lodash'; 

	app.factory('appConfigService',  ["$location", function($location) {
		
		function getSiteMapUrls(){
			return {
		        errors: {
		            notFound: "/404",
		            notAuthorized: "/403"
		        },

		        user: {
		            signIn: "/signin",
					verifyEmail : '/verify-email'
		        }
			};
		}

		return {
			getSiteMapUrls		:	getSiteMapUrls
	   };

    }]);

