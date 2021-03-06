'use strict';

var module = angular.module('app.services', []);

module.factory('Helpers', function(){
  var getCurrentDate = function(){
      var now = new Date();
      //"YYYY-MM-DDThh:mm:ss"^^xsd:date;
      var month = now.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_now = now.getFullYear() + "-" 
      + (month.toString().length==1 ? "0"+ month : month) + "-" 
      + (now.getDate().toString().length==1 ? "0"+now.getDate() : now.getDate())
      + "T" + (now.getHours().toString().length==1 ? "0" + now.getHours() : now.getHours()) + ":" 
      + (now.getMinutes().toString().length==1 ? "0" + now.getMinutes() : now.getMinutes()) + ":" 
      + (now.getSeconds().toString().length==1 ? "0" + now.getSeconds() : now.getSeconds());
     
     return s_now;
  };

  var convertDateToXsd = function(now){
      
      //"YYYY-MM-DDThh:mm:ss"^^xsd:date;
      var month = now.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_now = now.getFullYear() + "-" 
              + (month.toString().length==1 ? "0"+ month : month) + "-" 
              + (now.getDate().toString().length==1 ? "0"+now.getDate() : now.getDate())
              + "T" + (now.getHours().toString().length==1 ? "0" + now.getHours() : now.getHours()) + ":" 
              + (now.getMinutes().toString().length==1 ? "0" + now.getMinutes() : now.getMinutes()) + ":" 
              + (now.getSeconds().toString().length==1 ? "0" + now.getSeconds() : now.getSeconds())+"Z";
      return s_now;
  };
  
  var dateAdd = function(date, interval, units) {
	  var ret = new Date(date); //don't change original date
	  switch(interval.toLowerCase()) {
	    case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
	    case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
	    case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
	    case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
	    case 'day'    :  ret.setDate(ret.getDate() + units);  break;
	    case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
	    case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
	    case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
	    default       :  ret = undefined;  break;
	  }
	  return ret;
	}
  

  
  
  
  var invertMap = function (obj) {
    var new_obj = {};
    for (var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        new_obj[obj[prop]] = prop;
      }
    }
    return new_obj;
  };
  
  return {
      getCurrentDate: getCurrentDate,
      invertMap		: invertMap,
      dateAdd		: dateAdd,
      convertDateToXsd: convertDateToXsd
  };

});

module.factory('ServerErrorResponse', function() {

  var ServerErrorResponseService = {
   getMessage: function(response){
    var statusText = '';
      switch (response.status) {
      case 400:
        statusText = 'Bad Request';
        break;
      case 401:
        statusText = 'Unauthorized';
        break;
      case 403:
        statusText = 'Forbidden';
        break;
      case 404:
        statusText = 'Not Found ';
        break;
      case 500:
        statusText = 'Internal Server Error' + ( response.data =! ''? ': ' + response.data : '') ;
        break;
      case 503:
        statusText = 'Service Unavailable' + ( response.data =! ''? ': ' + response.data : '') ;
        break;
      default:
        statusText = 'An '+ response.status +' error occurred ' +( response.data =! ''? ': ' + response.data : '') ;
      };
      return statusText;
    }
  };
  return ServerErrorResponseService;
});



module.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
    'QRSTUVWXYZabcdef' +
    'ghijklmnopqrstuv' +
    'wxyz0123456789+/' +
    '=';
return {
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
	    }
	};
});


module.factory('AuthenticationErrorResponse', function() {
    return {
        getMessage: function(code) {
            var errorText = '';
            switch (code) {
                case 1:
                    errorText = 'User already exists';
                    break;
                case 2:
                    errorText = "Incorrect old password";
                    break;
                case 3:
                    errorText = "User doesn't exist";
                    break;
                default:
                    errorText = code;
            };
            return errorText;
        }
    };
});