/* ticker-text.js
* 
* An object.
*
* Calculates the amount of time the passed string will be
* shown. Uses a reference to a settings/state object
* containing a base speed value (based on wpm) and values
* that will alter that base depending on the characteristics
* of the string passed in.
* 
* Unless told otherwise, it will use a setting to start
* slowly and then reduce that extra delay as time goes on
* 
* QUESTION: Should this be an object or a function?
* ANSWER: An object. If it's a function, its use of "settings/
* state" data is buried inside the loop/timer (or wherever it's
* called from). That's too opaque. If it's an object, it's
* given the "settings" object right up front at the start.
* Much more transparent. Also, it does need some persistence
* for ._tempSlowStart
*/

(function (root, tickerFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
        	return ( root.TickerText = tickerFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = tickerFactory();
    } else {
        // Browser globals
        root.TickerText = tickerFactory();
    }
}(this, function () {

	"use strict";

	var TickerText = function ( state ) {
	/* ( {} ) -> TickerText
	* 
	*/
		var tktx = {};

		var _setts 				= null,
			tktx._tempSlowStart = null;

		// tktx.toMultiplyBy = ['sentenceDelay', 'otherPuncDelay',
		// 					 'shortWordDelay', 'longWordDelay',
		// 					 'numericDelay']
		var toMultiplyBy = tktx.toMultiplyBy = {
			'hasPeriod': 	'sentenceDelay',
			'hasOtherPunc': 'otherPuncDelay',
			'isShort': 		'shortWordDelay',
			'isLong': 		'longWordDelay',
			'isNumeric': 	'numericDelay'
		}


		// ============== RUNTIME ============== \\

		tktx.calcDelay = function ( str, justOnce ) {
		/* ( str, [bool] ) -> Float
		* 
		*/
			var processed = tktx._process( str );

			var delay = _setts._baseDelay;

			for ( let key in toMultiplyBy ) {
				if ( processed[ key ] ) {
					delay *= _setts[ toMultiplyBy[ key ] ];
				}
			}

			// if ( processed.hasPeriod ) 	  delay *= _setts.sentenceDelay;
			// if ( processed.hasOtherPunc ) delay *= _setts.otherPuncDelay;
			// if ( processed.isShort() ) 	  delay *= _setts.shortWordDelay;
			// if ( processed.isLong() ) 	  delay *= _setts.longWordDelay;
			// if ( processed.isNumeric ) 	  delay *= _setts.numericDelay;

			// Just after starting up again, go slowly, then speed up a bit
			// each time the loop is called, eating away at this number
			var extraDelay = tktx._tempSlowStart;
			// Make sure ._tempSlowStart isn't used up by things like .once()
			// called repeatedly, like when the scrubber is moved.
			// TODO: Make this customizable
			if (!justOnce) {tktx._tempSlowStart = Math.max( 1, extraDelay / 1.5 );}
			delay = delay * tktx._tempSlowStart;
			// Once is true all the time

			return delay;
		};  // End tktx.calcDelay()


		tktx.resetSlowStart = function ( val ) {
		/* ( num ) -> TickerText
		* 
		* For after restart or pause, assign a value to start the
		* text off slowly to warm the reader up to full speed.
		*/
			if ( val ) { tktx._tempSlowStart = val; }
			else { tktx._tempSlowStart = _setts.slowStartDelay; }
			return tktx;
		};


		// ======= PROCESSING STRING ======== \\

		tktx._process = function ( chars ) {
		/* ( str ) -> {}
		* 
		* Assesses the properties of a string, saving them in an object
		*/
			var result = { chars: chars };

	        tktx._setPuncProps( result );

			// TODO: Get from custom user settings
			// TODO: ??: Convert to array of lengths?
			var shortLength = 2,
				longLength 	= 8;

			chars.isShort = chars.length <= shortLength;
			chars.isLong  = chars.length >= longLength;

			result.isNumeric = /\d/.test(chars);

			return result;
		};  // End tktx._process()


		tktx._setPuncProps = function ( obj ) {
		/* ( str ) -> {}
		* 
		* Tests and sets the punctuation properties
		*/
			var str = obj.chars;

			// TODO: test for other sentence ending, punctuation, or nonsensical characters
			obj.hasPeriod 	  = /[.!?]/.test(str);
			obj.hasOtherPunc = /["'()”’:;,_]/.test(str);

			return tktx;
		};  // End tktx._setPuncProps()



		// ======= SET STARTING VALUES ======== \\

		tktx._init = function ( state ) {
			var _setts = tktx._settings = state._settings;
			tktx._tempSlowStart 		= tktx.resetSlowStart();
		}


		tktx._init( state );


		return tktx;
	};  // End Delay() -> {}

    return TickerText;
}));

