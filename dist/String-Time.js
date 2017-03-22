/* String-Time.js
* 
* A constructor for an object that can return a float.
*
* Meant to be used with Readerly's other modules, this
* object is tricky, and very tangled up with the code
* that creates and uses it.
* 
* The creator of a StringTime instance (tt) passes in a
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
* StringTime depends `state`'s properties repeatedly, so
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
* 
* 
* TODO:
* - Base `.slowStartDelay` on wpm, converting to a
* 	multiplier on the fly
*/

(function (root, timeFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
        	return ( root.StringTime = timeFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = timeFactory();
    } else {
        // Browser globals
        root.StringTime = timeFactory();
    }
}(this, function () {

	"use strict";

	var StringTime = function ( settings ) {
	/* ( {} ) -> StringTime
	* 
	*/
		var stm = {};

		var _setts 			= null;
		stm._tempSlowStart 	= null;

		// TODO: Rename 'slowStartDelay' to 'warmupDelay'
		var toMultiplyBy = stm._toMultiplyBy = {
			'hasPeriod': 	'sentenceDelay',
			'hasOtherPunc': 'otherPuncDelay',
			'isShort': 		'shortWordDelay',
			'isLong': 		'longWordDelay',
			'isNumeric': 	'numericDelay'
		}

		var defaults = stm.defaults = {
			wpm: 			250,
			_baseDelay: 	1/(250/60)*1000,  // based on wpm
			slowStartDelay: 5,
			sentenceDelay: 	5,
			otherPuncDelay: 2.5,
			numericDelay: 	2.0,
			shortWordDelay: 1.3,  // Will be obsolete
			longWordDelay: 	1.5,  // Will be obsolete
		};


		var oldStart = defaults.slowStartDelay;


		// ============== HOOKS ============== \\

		// // TODO: Switch to system of each property name having a corresponding function
		// stm.set = function ( obj ) {
		// // // `obj` consists of a function to check the string's properties,
		// // // that function's name, a delay value, and a name for that value
		// // 	toMultiplyBy[ obj.funcName ] = obj.delayName;

		// };


		// ============== RUNTIME ============== \\

		// --- Timing --- \\

		stm.orDefault = function ( propName ) {
		/* ( str ) -> Number
		* 
		* Determines whether to use a setting that's handed in
		* or a default one, throwing an error if necessary
		*/
			var val = null;

			if ( _setts && _setts[ propName ] !== undefined ) {

				var val = _setts[ propName ];

// console.log(propName + ':', val)
				if ( typeof val !== 'number' ) {
					// console.log('xxx type error xxx')
					throw new TypeError( "The settings value '" + propName + "' should have been a positive number, but was not. All I can print for you is this string version of that value: " + val );
				}
				if  ( val < 0 || isNaN(val) ) {
					// console.log('xxx range error xxx')
					throw new RangeError( "The settings value '" + propName + "' should have been a positive number, but was not. All I can print for you is this string version of that value: " + val );
				}

			} else {
				val = defaults[ propName ];
			}

			return val;
		};  // End stm.orDefault()


		stm.calcDelay = function ( str, justOnce ) {
		/* ( str, [bool] ) -> Float
		* 
		*/
			// TODO: ??: if (justOnce) {return 0}?
			// TODO: ??: Always reset slowStart when justOnce
			// === true?

			if ( typeof str !== 'string' ) {
				throw new TypeError( 'The first argument to `.calcDelay` was not a string. What you sent:', str )
			}
			if ( justOnce !== undefined && typeof justOnce !== 'boolean' ) {
				throw new TypeError( 'The optional second argument to `.calcDelay` was not undefined or a boolean. What you sent:', justOnce )
			}

			var processed = stm._process( str );

			var delay = stm.orDefault( '_baseDelay' );

			for ( let key in toMultiplyBy ) {
				if ( processed[ key ] ) {
					var delayModKey = toMultiplyBy[ key ];
					delay *= stm.orDefault( delayModKey );
				}
			}

			// Otherwise, in some situations, we won't notice if slow start needs to change
			// TODO: ??: Keep this on the curve of the change, so don't completely reset??
			var nowStart = stm.orDefault( 'slowStartDelay' );
			if ( oldStart !== nowStart  ) { stm.resetSlowStart(); }

			// Just after starting up again, go slowly, then speed up a bit
			// each time the loop is called, eating away at this number
			var extraDelay = stm._tempSlowStart;
			// Make sure ._tempSlowStart isn't used up by things like .once()
			// called repeatedly, like when the scrubber is moved.
			// Reduce ._tempSlowStart a bit each time
			// TODO: Make this customizable
			if (!justOnce) {stm._tempSlowStart = Math.max( 1, extraDelay / 1.5 );}

			delay = delay * stm._tempSlowStart;

			return delay;
		};  // End stm.calcDelay()


		stm.resetSlowStart = function ( val ) {
		/* ( num ) -> StringTime
		* 
		* For after restart or pause, assign a value to start the
		* text off slowly to warm the reader up to full speed.
		*/
			if ( val ) { stm._tempSlowStart = val; }  // What happens to the custom settings here?
			else {
				oldStart = stm._tempSlowStart = stm.orDefault( 'slowStartDelay' );
			}
			return stm;
		};


		// --- Processing String --- \\

		stm._process = function ( chars ) {
		/* ( str ) -> {}
		* 
		* Assesses the properties of a string, saving them in an object
		*/
			var result = { chars: chars };

	        stm._setPuncProps( result );

			// TODO: Get from custom user settings
			// TODO: ??: Transition to array of lengths?
			var shortLength = 2,
				longLength 	= 8;

			result.isShort = chars.length <= shortLength;
			result.isLong  = chars.length >= longLength;

			result.isNumeric = /\d/.test(chars);

			return result;
		};  // End stm._process()


		stm._setPuncProps = function ( obj ) {
		/* ( str ) -> {}
		* 
		* Tests and sets the punctuation properties
		*/
			var str = obj.chars;

			// TODO: test for other sentence ending, punctuation, or nonsensical characters
			obj.hasPeriod 	 = /[.!?]/.test(str);
			obj.hasOtherPunc = /["'()”’:;,_]/.test(str);

			return stm;
		};  // End stm._setPuncProps()



		// ======= SET STARTING VALUES ======== \\

		// --- validation --- \\
		stm._checkSettings = function ( settings ) {
		// Check all the custom settings and throw an error if needed
			if ( !settings ) { return stm; }

			for ( let key in toMultiplyBy ) {
				let name = toMultiplyBy[ key ];
				stm.orDefault( name );
			}

			stm.orDefault( '_baseDelay' );
			stm.orDefault( 'slowStartDelay' );

			return stm;
		}


		stm._init = function ( settings ) {
		// `settings` can be an object, empty or not, or something falsy
			_setts = stm._settings = settings;
			stm._checkSettings( settings );

			stm.resetSlowStart();  // Start at default warmup setting
			return stm;
		}


		stm._init( settings );

		return stm;
	};  // End StringTime() -> {}

    return StringTime;
}));

