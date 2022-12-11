
import app from 'app';
import _ from 'lodash';
import 'linqjs';
import 'bootbox';

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
	

