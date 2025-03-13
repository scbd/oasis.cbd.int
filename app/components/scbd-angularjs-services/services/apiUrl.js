import app from '~/app';

    app.factory('apiUrl', ["$q", "$location", function($q, $location) {


            function devApiUrl(url) {
                return window.scbd.apiHost;
            }

            function devAccountsUrl() {
                return window.scbd.accountsUrl;
            }


            // /^https:\/\/accounts.cbddev.xyz\//i,
            // /^https:\/\/absch.cbddev.xyz\//i,
            // /^https:\/\/chm.cbddev.xyz\//i,
            function isAppDevelopment() {
                var knownDevUrls = [
                    /^https:\/\/\w+.cbddev.xyz\//i, //everything under cbddev.xyz
                ];

                var url = $location.$$absUrl;

                for (var i = 0; i < knownDevUrls.length; i++) {
                    if (url.match(knownDevUrls[i])) {
                        return true;
                    }
                }
                return false;
            }

            return {
                devApiUrl       : devApiUrl,
                devAccountsUrl  : devAccountsUrl,
                isAppDevelopment: isAppDevelopment
            };
    }]);

