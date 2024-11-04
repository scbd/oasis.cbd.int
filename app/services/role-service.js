import app from '~/app';
import _ from 'lodash';
import './app-config-service'; 
import { ROLES } from '../utils/constants';

	app.factory('roleService',  ["$http","$location", "$rootScope", "appConfigService",
	 function($http,$location, $rootScope, appConfigService) {

		return new function(){

			this.isUserInRole = function(role) {

				if (!$rootScope.user)
					return false;

				return _.includes($rootScope.user.roles, role);
			};
			
			this.isUserInRoles = function(roles) {

				if (!$rootScope.user)
					return false;

				return _.intersection($rootScope.user.roles, roles).length > 0;
			};
			
			this.isIAC = function() {
				return this.isUserInRole(appConfigService.getRoleName('abschiac'));
			}

			this.isAdministrator = function() {
				return this.isUserInRole(appConfigService.getRoleName(ROLES.ADMINISTRATOR));
			}
			this.isAbsAdministrator = function() {
				return this.isUserInRole(appConfigService.getRoleName(ROLES.ABS_ADMINISTRATOR));
			}

			this.isAbsPublishingAuthority = function() {
				return this.isUserInRole(appConfigService.getRoleName(ROLES.ABS_PUBLISHING_AUTHORITIES));
			}
			this.isAbsNationalAuthorizedUser = function() {
				return this.isUserInRole(appConfigService.getRoleName(ROLES.ABS_NATIONAL_AUTHORIZED_USER));
			}

			this.isAbsNationalFocalPoint = function() {
				return this.isUserInRole(appConfigService.getRoleName(ROLES.ABS_NATIONAL_FOCAL_POINT));
			}

			this.isUser = function() {
				return this.isUserInRole(appConfigService.getRoleName('User'));
			}

			this.isAnyOtherRoleThanIAC = function() {

				return this.isAbsPublishingAuthority() ||
					this.isAbsNationalAuthorizedUser() ||
					this.isAbsNationalFocalPoint() ||
					this.isAbsAdministrator() ||
					this.isAdministrator()

			}
			this.hasAbsRoles = function() {
				return this.isAbsAdministrator() || this.isAnyOtherRoleThanIAC() || this.isIAC();
			}
		}

    }]);

