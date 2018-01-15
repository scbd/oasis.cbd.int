define(['app',
	'scbd-angularjs-services/authentication'
], function (app, moment) {

	return ["$scope", "$location", "authentication", function ($scope, $location, authentication) {

		$scope.email = null;
		$scope.password = null;

		//============================================================
		//
		//
		//============================================================
		$scope.signIn = function () {

			$scope.errorInvalid = false;
			$scope.errorTimeout = false;
			$scope.waiting = true;
			authentication.signIn($scope.email, $scope.password)
				.then(function (user) {

					$scope.user = user;
					if ($location.search().returnUrl)
						$location.url($location.search().returnUrl);
					else
						$location.url('/');
				})
				.catch(function onerror(error) {
					$scope.password = "";
					$scope.errorInvalid = error.errorCode == 403;
					$scope.errorTimeout = error.errorCode != 403;
				})
				.finally(function () {
					$scope.waiting = false;
				});
		};

		$scope.actionSignup = function () {
			var redirect_uri = encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/');
			$window.location.href = 'https://accounts.cbd.int/signup?redirect_uri=' + redirect_uri;
		};

		// $rootScope.$on('event:auth-sessionExpired', function (evt, data) {

		// 	$scope.user = undefined;
		// 	$scope.sessionExpiredAlert = true;
		// 	$('#loginDialog').modal({
		// 		backdrop: "static",
		// 		keyboard: false
		// 	});
		// })

	}];
});
