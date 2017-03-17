/* Ticker-Text.js
* 
* A constructor for an object that can return a float.
*
* Meant to be used with Readerly's other modules, this
* object is tricky, and very tangled up with the code
* that creates and uses it.
* 
* The creator of a TickerText instance (tt) passes in a
* reference to an object which contains a `._settings`
* property, which itself must contain these properties:
* 
* Base delay to work off of:
* - _baseDelay (>=0, usually based on desired words per
* 	minute)
* Delay modifiers:
* - slowStartDelay (>0)
* - sentenceDelay (>0)
* - otherPuncDelay (>0)
* - shortWordDelay (>0)
* - longWordDelay (>0)
* - numericDelay (>0)
* 
* When `tt.calcDelay(str, bool)` is called, it tests the
* properties of a string. It then uses the base delay
* multiplied by the given modifiers to return how many
* milliseconds a string should be displayed in the RSVP
* app.
* 
* TickerText depends `state`'s properties repeatedly, so
* they can't be destroyed.
* 
* There are two other important features.
* 
* 1. The `slowStartDelay` property lets `tt` start the RSVP
* reader slowly, then lets it gain speed. You can reset to
* your currently stored slow speed using `tt.resetSlowStart`.
* 
* 2. Passing a value of `true` as the optional second argument
* to `tt.calcDelay()` freezes the progress of that speeding
* up. In future, it may use that boolean to reset the slow
* starting speed.
* 
* The functionality to add more delay modifiers after the
* fact hasn't been created yet.
* 
* 
* QUESTION: Should an instance be an object or a function?
* ANSWER: An object. If it's a function, its use of
* "settings/ state" data is buried inside the loop/timer
* (or wherever it's called from). That's too opaque. If
* it's an object, it's given the "settings" object right
* up front at the start. Much more transparent. Also, it
* does need some persistence for `._tempSlowStart`
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

	var TickerText = function ( settings ) {
	/* ( {} ) -> TickerText
	* 
	*/
		var tktx = {};

		var _setts 			= null;
		tktx._tempSlowStart = null;

		var toMultiplyBy = tktx._toMultiplyBy = {
			'hasPeriod': 	'sentenceDelay',
			'hasOtherPunc': 'otherPuncDelay',
			'isShort': 		'shortWordDelay',
			'isLong': 		'longWordDelay',
			'isNumeric': 	'numericDelay'
		}

		var defaults = tktx.defaults = {
			wpm: 			250,
			_baseDelay: 	1/(250/60)*1000,  // based on wpm
			slowStartDelay: 5,
			sentenceDelay: 	5,
			otherPuncDelay: 2.5,
			numericDelay: 	2.0,
			shortWordDelay: 1.3,  // Will be obsolete
			longWordDelay: 	1.5,  // Will be obsolete
		};


		// ============== HOOKS ============== \\

		// // TODO: Switch to system of each property name having a corresponding function
		// tktx.set = function ( obj ) {
		// // // `obj` consists of a function to check the string's properties,
		// // // that function's name, a delay value, and a name for that value
		// // 	toMultiplyBy[ obj.funcName ] = obj.delayName;

		// };


		// ============== RUNTIME ============== \\

		tktx.calcDelay = function ( str, justOnce ) {
		/* ( str, [bool] ) -> Float
		* 
		*/
			// TODO: ??: if (justOnce) {return 0}?
			// TODO: ??: Always reset slowStart when justOnce
			// === true?

			var processed = tktx._process( str );

			var delay = _setts._baseDelay;

			for ( let key in toMultiplyBy ) {
				if ( processed[ key ] ) {

					var delayModKey = toMultiplyBy[ key ]
					delay *= _setts[ delayModKey ] || defaults[ delayModKey ];

				}
			}

			// Just after starting up again, go slowly, then speed up a bit
			// each time the loop is called, eating away at this number
			var extraDelay = tktx._tempSlowStart;
			// Make sure ._tempSlowStart isn't used up by things like .once()
			// called repeatedly, like when the scrubber is moved.
			// Reduce ._tempSlowStart a bit each time
			// TODO: Make this customizable
			if (!justOnce) {tktx._tempSlowStart = Math.max( 1, extraDelay / 1.5 );}

			delay = delay * tktx._tempSlowStart;

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


		// - Processing String - \\

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

			result.isShort = chars.length <= shortLength;
			result.isLong  = chars.length >= longLength;

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
			obj.hasPeriod 	 = /[.!?]/.test(str);
			obj.hasOtherPunc = /["'()”’:;,_]/.test(str);

			return tktx;
		};  // End tktx._setPuncProps()



		// ======= SET STARTING VALUES ======== \\

		tktx._init = function ( settings ) {
			_setts = tktx._settings = settings || defaults;
			tktx.resetSlowStart();
			return tktx;
		}


		tktx._init( settings );

		return tktx;
	};  // End Delay() -> {}

    return TickerText;
}));

