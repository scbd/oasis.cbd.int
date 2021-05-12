define(['app', 'lodash', 'ngStorage'],
 function (app, _) { 'use strict';

	app.factory('localStorageService',  ["$http","$location", "$rootScope", "$sessionStorage","$localStorage",
	 function($http,$location, $rootScope, $sessionStorage, $localStorage) {

        var $browserStorage = $localStorage

		return new function(){

            this.get = function(key){
                
                if(!$browserStorage.$supported)
                    return;

                var existing = angular.copy($browserStorage[key]);

                if(!existing)
                    return;

                if(new Date() < new Date(existing.expiry))
                    return existing.data;

                //remove expired data from storage;
                console.log(key);
                this.remove(key);

                return;
            };

            this.set = function(key, data, expireInDays){
                if(!$browserStorage.$supported)
                    return;
                    
                var ldata = {};

                var expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + (expireInDays||2));

                ldata.expiry = expiryDate;
                ldata.data   = data;

                $browserStorage[key] = ldata;
            };

            this.remove = function(key){
                delete $browserStorage[key];
            };

            this.removeAll = function(){
                $browserStorage.$reset();
            };

            this.hasStorageExpired = function(key, expiryDate){
                var today = new Date();
                return expiryDate.getFullYear() < today.getFullYear()
                    && expiryDate.getDate()     < today.getDate()
                    && expiryDate.getMonth()    < today.getMonth();
            };
		};

    }]);
});
