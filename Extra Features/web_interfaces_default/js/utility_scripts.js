/** JavaScript file of utility functions.
  * At present contains functions for sanitising of URLs,
  * since tomcat 8+, being more compliant with URL/URI standards, is more strict about URLs.
  */

/* 
   Given a string consisting of a single character, returns the %hex (%XX)
   https://www.w3resource.com/javascript-exercises/javascript-string-exercise-27.php
   https://stackoverflow.com/questions/40100096/what-is-equivalent-php-chr-and-ord-functions-in-javascript
   https://www.w3resource.com/javascript-exercises/javascript-string-exercise-27.php
*/
function urlEncodeChar(single_char_string) {
    /*var hex = Number(single_char_string.charCodeAt(0)).toString(16);
    var str = "" + hex;
    str = "%" + str.toUpperCase();
    return str;
    */

    var hex = "%" + Number(single_char_string.charCodeAt(0)).toString(16).toUpperCase();
    return hex;
}

/*
  Tomcat 8 appears to be stricter in requiring unsafe and reserved chars
  in URLs to be escaped with URL encoding
  See section "Character Encoding Chart of
  https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  Reserved chars:
     ; / ? : @ = &
     ----->  %3B %2F %3F %3A %40 %3D %26
  Unsafe chars:
     " < > # % { } | \ ^ ~ [ ] ` and SPACE/BLANK
     ----> %22 %3C %3E %23 %25 %7B %7D %7C %5C %5E ~ %5B %5D %60 and %20
  But the above conflicts with the reserved vs unreserved listings at
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
  Possibly more info: https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid

  Javascript already provides functions encodeURI() and encodeURIComponent(), see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
  However, the set of chars they deal with only partially overlap with the set of chars that need encoding as per the RFC3986 for URIs and RFC1738 for URLs discussed at
  https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  We want to handle all the characters listed as unsafe and reserved at https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  so we define and use our own conceptually equivalent methods for both existing JavaScript methods: 
  - makeSafeURL() for Javascript's encodeURI() to make sure all unsafe characters in URLs are escaped by being URL encoded
  - and makeSafeURLComponent() for JavaScript's encodeURIComponent to additionally make sure all reserved characters in a URL portion are escaped by being URL encoded too

  Function makeSafeURL() is passed a string that represents a URL and therefore only deals with characters that are unsafe in a URL and which therefore require escaping. 
  Function makeSafeURLComponent() deals with portions of a URL that when decoded need not represent a URL at all, for example data like inline templates passed in as a
  URL query string's parameter values. As such makeSafeURLComponent() should escape both unsafe URL characters and characters that are reserved in URLs since reserved
  characters in the query string part (as query param values representing data) may take on a different meaning from their reserved meaning in a URL context.
*/

/* URL encodes both 
   - UNSAFE characters to make URL safe, by calling makeSafeURL()
   - and RESERVED characters (characters that have reserved meanings within a URL) to make URL valid, since the url component parameter could use reserved characters
   in a non-URL sense. For example, the inline template (ilt) parameter value of a URL could use '=' and '&' signs where these would have XSLT rather than URL meanings.
  
   See end of https://www.w3schools.com/jsref/jsref_replace.asp to use a callback passing each captured element of a regex in str.replace()
*/
function makeURLComponentSafe(url_part, encode_percentages) {
    // https://stackoverflow.com/questions/12797118/how-can-i-declare-optional-function-parameters-in-javascript
    encode_percentages = encode_percentages || 1; // this method forces the URL-encoding of any % in url_part, e.g. do this for inline-templates that haven't ever been encoded
    
    var url_encoded = makeURLSafe(url_part, encode_percentages);
    //return url_encoded.replace(/;/g, "%3B").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/\:/g, "%3A").replace(/\@/g, "%40").replace(/=/g, "%3D").replace(/\&/g,"%26");
    url_encoded = url_encoded.replace(/[\;\/\?\:\@\=\&]/g, function(s) { 
	return urlEncodeChar(s);
    }); 
    return url_encoded;
}

/* 
   URL encode UNSAFE characters to make URL passed in safe.
   Set encode_percentages to 1 (true) if you don't want % signs encoded: you'd do so if the url is already partly URL encoded.
*/
function makeURLSafe(url, encode_percentages) {    
    encode_percentages = encode_percentages || 0; // https://stackoverflow.com/questions/12797118/how-can-i-declare-optional-function-parameters-in-javascript

    var url_encoded = url;
    if(encode_percentages) { url_encoded = url_encoded.replace(/\%/g,"%25"); } // encode % first
    //url_encoded = url_encoded.replace(/ /g, "%20").replace(/\"/g,"%22").replace(/\</g,"%3C").replace(/\>/g,"%3E").replace(/\#/g,"%23").replace(/\{/g,"%7B").replace(/\}/g,"%7D");
    //url_encoded = url_encoded.replace(/\|/g,"%7C").replace(/\\/g,"%5C").replace(/\^/g,"%5E").replace(/\[/g,"%5B").replace(/\]/g,"%5D").replace(/\`/g,"%60");
    // Should we handle ~, but then what is its URL encoded value? Because https://meyerweb.com/eric/tools/dencoder/ URLencodes ~ to ~.
    //return url_encoded;    
    url_encoded = url_encoded.replace(/[\ \"\<\>\#\{\}\|\\^\~\[\]\`]/g, function(s) { 
	return urlEncodeChar(s);
    });
    return url_encoded;
}
