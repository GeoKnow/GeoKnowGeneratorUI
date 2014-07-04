'use strict';

var module = angular.module('app.services', []);

module.factory('Helpers', function(){
  var getCurrentDate = function(){
      var now = new Date();
      //"YYYY-MM-DDThh:mm:ss"^^xsd:date;
      var month = now.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_now = now.getFullYear() + "-" 
              + (month.toString().length==1 ? "0"+ month : month + "-") 
              + (now.getDate().toString().length==1 ? "0"+now.getDate() : now.getDate())
              + "T" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      return s_now;
  };

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
      getCurrentDate :getCurrentDate,
      invertMap : invertMap
  };

});

module.factory('ServerErrorResponse', function(localize) {

  var ServerErrorResponseService = {

   getMessage: function(status){
   
    var statusText = '';
      switch (status) {
      case 400:
        statusText = localize.getLocalizedString('_bad-request_');
        break;
      case 401:
        statusText = localize.getLocalizedString('_unauthorized_');
        break;
      case 403:
        statusText = localize.getLocalizedString('_forbidden_');
        break;
      case 404:
        statusText = localize.getLocalizedString('_not-found_');
        break;
      case 500:
        statusText = localize.getLocalizedString('_internal-server-error_');
        break;
      default:
        statusText = localize.getLocalizedString('_error-occurred_')+':'+status;
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


module.factory('AuthenticationErrorResponse', function(localize) {
    return {
        getMessage: function(code) {
            var errorText = '';
            switch (code) {
                case 1:
                    errorText = localize.getLocalizedString("_user-already-exists-error_");
                    break;
                default:
                    errorText = code;
            };
            return errorText;
        }
    };
});