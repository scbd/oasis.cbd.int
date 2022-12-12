
import app from "~/app";

	app.filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });

	
	//https://github.com/HubSpot/humanize/blob/master/public/src/humanize.js
	app.filter('humanizeNumber', function() {
		return function(value) {
		    var end, leastSignificant, number, specialCase;
		    number = parseInt(value, 10);
		    if (number === 0) {
		      return value;
		    }
		    specialCase = number % 100;
		    if (specialCase === 11 || specialCase === 12 || specialCase === 13) {
		      return "" + number + "th";
		    }
		    leastSignificant = number % 10;
		    switch (leastSignificant) {
		      case 1:
		        end = "st";
		        break;
		      case 2:
		        end = "nd";
		        break;
		      case 3:
		        end = "rd";
		        break;
		      default:
		        end = "th";
		    }
		    return "" + number + end;
		};
	});

