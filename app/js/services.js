﻿
define(['app', 'lodash', 'linqjs','bootbox'], function (app, _) {

	app.factory("htmlUtility", function() {
		return {
			encode: function(srcText) {
				return $('<div/>').text(srcText).html();
			}
		};
	});

	app.factory('lodash', [function() {
		return _;
	}])


	app.factory('lodash', [function() {
		return _;
	}])
	
});
