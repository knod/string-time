describe( "When a StringTime instance is created", function () {

	var StringTime = require('../../dist/String-Time.js');

	var stm;
	beforeEach(function() { stm = new StringTime() });


	// ======== !!! NOTE !!! ======== \\
	// If `.defaults` are changed, these results are going to change...


	// ======== NO CONSTRUCTOR ARGUMENTS ======== \\
	describe( "without an argument that instance's `.calcDelay()`", function () {

		// --- Basics --- \\
		it( "should return a number.", function () {
			expect( typeof stm.calcDelay( 'abcd' ) ).toEqual( 'number' );
		});

		it( "should use its default settings.", function () {
			var defs = {
				wpm: 			250,
				_baseDelay: 	1/(250/60)*1000,
				slowStartDelay: 5,
				sentenceDelay: 	5,
				otherPuncDelay: 2.5,
				numericDelay: 	2.0,
				shortWordDelay: 1.3,
				longWordDelay: 	1.5,
			};
			expect( stm.defaults ).toEqual( defs );
			expect( stm.calcDelay( 'abcd' ) ).toEqual( 800 );
		});

		it( "should start with a `._tempSlowStart` value equal to its `.defaults.slowStartDelay`.", function () {
			expect( stm._tempSlowStart ).toEqual( stm.defaults.slowStartDelay );  // 5
		});

		describe( ", when called four times in a row with a string that has no other modifiers,", function () {

			it( "should reduce the slow start delay by 1/1.5 each time with a minimum value of 1.", function () {

				var start = stm.defaults.slowStartDelay;

				expect( stm._tempSlowStart ).toEqual( start );  // 5
				
				var faster = stm.calcDelay( 'abcd' );
				expect( faster ).toEqual( 800 );
				expect( stm._tempSlowStart ).toEqual( start/1.5 );  // 3.3333333333333335

				faster = stm.calcDelay( 'abcd' );
				expect( Math.floor( faster ) ).toEqual( 533 );  // 533.3333333333334
				expect( stm._tempSlowStart ).toEqual( start/1.5/1.5 );  // 1.4814814814814816

				faster = stm.calcDelay( 'abcd' );
				expect( Math.floor( faster ) ).toEqual( 355 );  // 355.5555555555556
				expect( stm._tempSlowStart ).toEqual( start/1.5/1.5/1.5 );  // 1.4814814814814816

				faster = stm.calcDelay( 'abcd' );
				expect( faster ).toEqual( 240 )
				expect( stm._tempSlowStart ).toEqual( 1 );

			});

		});

		describe( ", when its `.resetSlowStart()` method is used,", function () {

			it( "should refresh the slow start delay value.", function () {

				var one = stm.calcDelay( 'abcd' ),
					two = stm.calcDelay( 'abcd' ),
					reset = stm.resetSlowStart();
				expect( stm._tempSlowStart ).toEqual( stm.defaults.slowStartDelay );

				var three = three = stm.calcDelay( 'abcd' )
				expect( three ).toEqual(800)

			});

		});


		// --- Expected Instance Values --- \\
		describe( ", given a string with these modifying characteristics:", function () {
			
			var ms;

			// ---- Nothing Special ---- \\
			describe( "none,", function () {
				beforeEach(function() { ms = 800 });
				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'abcd' ) ).toEqual( ms );
				});
			});
			
			// ---- Short Word ---- \\
			describe( "less than 3 characters,", function () {

				beforeEach(function() { ms = 1040 });

				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'ab' ) ).toEqual( ms );
				});

				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'a' ) ).toEqual( ms );
				});

				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				// ??: Should return 0?
				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( '' ) ).toEqual( ms );
				});

			});  // End < 3 characters
			
			// ---- Long Word ---- \\
			describe( "more than 8 characters,", function () {
				beforeEach(function() { ms = 1200 });
				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'abcdabcda' ) ).toEqual( ms );
				});
			});  // End > 8 characters

			// ---- Sentence-ender Punctuation ---- \\
			describe( "one or more of '.', '!', and/or '?' ,", function () {
				
				beforeEach(function() { ms = 4000 });

				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'abcd.' ) ).toEqual( ms );
				});

				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'abc.d..' ) ).toEqual( ms );
				});

				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'abc.d.!' ) ).toEqual( ms );
				});

				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( 'abc.d.?' ) ).toEqual( ms );
				});

			});  // End sentence

			// ---- Other Punctuation ---- \\
			describe( "(other punctuation)", function () {
				
				beforeEach(function() { ms = 2000 });

				describe( "one or more '\"'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd"' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( '"abcd"' ) ).toEqual( ms );
					});
				});

				describe( "one or more \"'\"'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( "abcd'" ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( "'abcd'" ) ).toEqual( ms );
					});
				});

				describe( "one or more '”'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd”' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( '”abcd”' ) ).toEqual( ms );
					});
				});

				describe( "one or more '’'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd’' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( '’abcd’' ) ).toEqual( ms );
					});
				});

				describe( "one or more '('", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd(' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( '(abcd(' ) ).toEqual( ms );
					});
				});

				describe( "one or more ')'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd)' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( ')abcd)' ) ).toEqual( ms );
					});
				});

				describe( "one or more ':'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd:' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( ':abcd:' ) ).toEqual( ms );
					});
				});

				describe( "one or more ';'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd;' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( ';abcd;' ) ).toEqual( ms );
					});
				});

				describe( "one or more ','", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd,' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( ',abcd,' ) ).toEqual( ms );
					});
				});

				describe( "one or more '_'", function () {
					it( "should return " + ms + ".", function () {
						expect( stm.calcDelay( 'abcd_' ) ).toEqual( ms );
						stm.resetSlowStart();
						expect( stm.calcDelay( '_abcd_' ) ).toEqual( ms );
					});
				});

			// TODO: Add more punctuation and more cases
			});  // End non-sentence ending punctuation

			// ---- Numerical ---- \\
			describe( "any numerical characters,", function () {

				beforeEach(function() { ms = 1600 });
				it( "should return " + ms + ".", function () {
					expect( stm.calcDelay( '12345' ) ).toEqual( ms );
					stm.resetSlowStart();
					expect( stm.calcDelay( 'ab345' ) ).toEqual( ms );
					stm.resetSlowStart();
					expect( stm.calcDelay( '123de' ) ).toEqual( ms );
					stm.resetSlowStart();
					expect( stm.calcDelay( '12cd5' ) ).toEqual( ms );
				});

			});  // End numerical characters

			// ---- Combos of characteristics ---- \\


		});  // End string characteristics


		// ============= ERRORS ============= \\
		// ---- Unexpected Values For First Argument ---- \\
		describe( ", when given no first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay() } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given `null` as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( null ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given `true` as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( true ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given `false` as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( false ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given an object as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( {} ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given an empty array as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( [] ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given an array as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( [1, 2, 3] ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return stm.calcDelay( ['1', '2', '3'] ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given a number as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return stm.calcDelay( 0 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return stm.calcDelay( 1 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return stm.calcDelay( 5 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return stm.calcDelay( -1 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return stm.calcDelay( 0.1 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return stm.calcDelay( -0.1 ) } ).toThrowError( TypeError, /first/ )
			});
		});

		// ---- justOnce, Expected Values ---- \\

		// TODO: Throw a bad value/type error if the second argument is not a bool or undefined
		describe( ", when given NOTHING as a second argument", function () {
			it( "SHOULD reduce its `._tempSlowStart` value", function () {

				var start = stm._tempSlowStart;
				stm.calcDelay( 'abcd' );
				expect( stm._tempSlowStart ).toEqual( start/1.5 );

			});
		});

		describe( ", when given `true` as a second argument", function () {
			it( "should not decrease its `._tempSlowStart`", function () {

				var start = stm._tempSlowStart;
				stm.calcDelay( 'abcd', true );
				expect( stm._tempSlowStart ).toEqual( start );

			});
		});

		// TODO: ??: Throw a bad value/type error if the second argument is not a bool or undefined??
		// TODO: ??: Only check for 'true'??
		describe( ", when given `false` as the second argument", function () {
			it( "SHOULD reduce its `._tempSlowStart` value", function () {

				var start = stm._tempSlowStart;
				stm.calcDelay( 'abcd', false );
				expect( stm._tempSlowStart ).toEqual( start/1.5 );

			});
		});

		// ---- justOnce, Unexpected Values ---- \\

		describe( "should give a TypeError", function () {

			it( "when given `null` as a second argument", function () {
				expect( function(){ return stm.calcDelay( 'abcd', null ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given an object as a second argument", function () {
				expect( function(){ return stm.calcDelay( 'abcd', {} ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given an empty array as a second argument", function () {
				expect( function(){ return stm.calcDelay( 'abcd', [] ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given an array as a second argument", function () {
				expect( function(){ return stm.calcDelay( 'abcd', [1, 2, 3] ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', ['1', '2', '3'] ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given a number as a second argument", function () {
				expect( function(){ return stm.calcDelay( 'abcd', 0 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', 1 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', 5 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', -1 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', 0.1 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', -0.1 ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given a string as a second argument", function () {
				expect( function(){ return stm.calcDelay( 'abcd', '0' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', '1' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', 'abcd' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', '' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return stm.calcDelay( 'abcd', '#*' ) } ).toThrowError( TypeError, /second/ )
			});

		});  // End justOnce TypeError

	});  // End no-argument constructor



	// ======== WITH CONSTRUCTOR ARGUMENTS (Custom Settings) ======== \\


	var oneChangedValue = function ( propName, val, obj ) {

		var oneChanged = obj || {
			wpm: 			400,
			_baseDelay: 	1/(400/60)*1000,  // based on wpm
			slowStartDelay: 3,
			sentenceDelay: 	2,
			otherPuncDelay: 5,
			numericDelay: 	3.2,
			shortWordDelay: 1.3,
			longWordDelay: 	1.5,
		};

		oneChanged[ propName ] = val;

		return oneChanged;
	};  // End oneChangedValue()


	var wrongValues = [ null, true, false, {}, [], [1.3], '1', NaN, -1 ];
	var props = [ '_baseDelay', 'slowStartDelay', 'sentenceDelay',
	'otherPuncDelay', 'numericDelay', 'shortWordDelay', 'longWordDelay' ];

	describe( "with an argument", function () {

		// ----- Expected constructor argument ----- \\
		describe( "that is an empty object", function () {
			it( "should not throw an error.", function() {
				expect( function() { new StringTime( {} ); } ).not.toThrowError();
			})
		});  // End constructor argument empty object

		// ----- Unexpected constructor argument ----- \\
		describe( "that has an unexpected value", function () {

			it( "should throw an appropriate error.", function() {

				for (let vali = 0; vali < wrongValues.length; vali++) {
					
					let wrongVal = wrongValues[vali];
					for ( let propi = 0; propi < props.length; propi++ ) {

						let prop = props[ propi ];
						let arg = oneChangedValue( prop, wrongVal )

						if ( wrongVal !== {} ) {  // empty objects are ok
							expect( function() { new StringTime( arg ); } ).toThrowError();
						}
					}  // end for every property
				}  // end for every wrong value
			})
		});  // End constructor argument invalid

		// ----- Unexpected Values when constructed ----- \\
		describe( "containing an unexpected value", function () {

			it( "it should throw an error during construction", function () {

				for (let vali = 0; vali < wrongValues.length; vali++) {
					
					let wrongVal = wrongValues[vali];
					for ( let propi = 0; propi < props.length; propi++ ) {

						let prop = props[ propi ];
						let arg = oneChangedValue( prop, wrongVal )

						if ( typeof arg[prop] !== 'number' ) {
							expect( function() { new StringTime( arg ); } ).toThrowError( TypeError )
						} else {
							expect( function() { new StringTime( arg ); } ).toThrowError( RangeError )
						}

					}  // end for every property

				}  // end for every wrong value

			});  // End error during construction

		});  // End constructor argument containing unexpected value

		// ----- Expected Values when constructed ----- \\
		describe( "that contains valid values", function () {

			var custom;
			beforeEach(function() {
				custom = {
					wpm: 			400,
					_baseDelay: 	1/(400/60)*1000,  // based on wpm
					slowStartDelay: 3,
					sentenceDelay: 	2,
					otherPuncDelay: 5,
					numericDelay: 	3.2,
					shortWordDelay: 1.3,
					longWordDelay: 	1.5,
				};
				stm = new StringTime( custom )
			});

			describe( "that instance's `.calcDelay()`", function () {

				// ----- Expected Values ----- \\
				it( "should use the reference to the custom settings object", function () {
					expect( stm._settings ).toBe( custom );
				});

				describe( "should use the custom settings object's values", function () {

					it("for plain strings.", function() {
						expect( stm.calcDelay( 'abcd' ) ).toEqual( 300 );
					})

					it("for short strings.", function() {
						expect( stm.calcDelay( 'ab' ) ).toEqual( 390 );
					})

					it("for long strings.", function() {
						expect( stm.calcDelay( 'abcdefghijklm' ) ).toEqual( 450 );
					})

					it("for strings with sentence-ending punctuation.", function() {
						expect( stm.calcDelay( 'abcd.' ) ).toEqual( 600 );
					})

					it("for strings with non-sentence-ending punctuation.", function() {
						expect( stm.calcDelay( 'abcd,' ) ).toEqual( 1500 );
					})

					it("for strings with numbers.", function() {
						expect( stm.calcDelay( 'abc3' ) ).toEqual( 960 );
					})

				});  // End regular custom settings values


				// ---- that change ---- \\
				describe( "should reflect the changes in the custom `settings` object.", function () {

					beforeEach(function() {
						var custom2 = {
							wpm: 			400,
							_baseDelay: 	1/(400/60)*1000,  // based on wpm
							slowStartDelay: 3,
							sentenceDelay: 	2,
							otherPuncDelay: 5,
							numericDelay: 	3.2,
							shortWordDelay: 1.3,
							longWordDelay: 	1.5,
						};
						stm = new StringTime( custom2 )
						// wpm isn't used as a modifier, just used elsewhere to calculate _baseDelay
						custom2._baseDelay 		= 450;
						custom2.slowStartDelay 	= 4;
						custom2.sentenceDelay 	= 6;
						custom2.otherPuncDelay 	= 2.8;
						custom2.numericDelay 	= 4;
						custom2.shortWordDelay 	= 2.4;
						custom2.longWordDelay 	= 1.2;
					});

					it( "For `_baseDelay`.", function () {
						expect( stm._settings._baseDelay ).toEqual( 450 );
						expect( stm.calcDelay( 'abcd' ) ).toEqual( 1200 );
					});

					it("For short strings.", function() {
						expect( stm.calcDelay( 'ab' ) ).toEqual( 2880 );
					})

					it("For long strings.", function() {
						expect( stm.calcDelay( 'abcdefghijklm' ) ).toEqual( 1440 );
					})

					it("For strings with sentence-ending punctuation.", function() {
						expect( stm.calcDelay( 'abcd.' ) ).toEqual( 7200 );
					})

					it("For strings with non-sentence-ending punctuation.", function() {
						expect( stm.calcDelay( 'abcd,' ) ).toEqual( 3360 );
					})

					it("For strings with numbers.", function() {
						expect( stm.calcDelay( 'abc3' ) ).toEqual( 4800 );
					})

				});  // End changes in custom settings object

			});  // End calling `.calcDelay()`

			// --- after changing to an unexpected value --- \\
			describe( "and the values change to something unexpected,", function () {

				it( "when `.calcDelay()` is called an error should be thrown.", function () {

					for (let vali = 0; vali < wrongValues.length; vali++) {
						
						let wrongVal = wrongValues[vali];
						for ( let propi = 0; propi < props.length; propi++ ) {

							let propName = props[ propi ],
								oldVal 	 = custom[ propName ];

							oneChangedValue( propName, wrongVal, custom )
							let newVal 	 = custom[ propName ]

							if ( propName === 'shortWordDelay' ) {

								if ( typeof newVal !== 'number' ) {
									expect( function() { stm.calcDelay( 'ab' ) } ).toThrowError( TypeError )
								} else {
									expect( function() { stm.calcDelay( 'ab' ) } ).toThrowError( RangeError )
								}
							} else if ( propName === 'longWordDelay' ) {

								if ( typeof newVal !== 'number' ) {
									expect( function() { stm.calcDelay( 'abcdefghijklm' ) } ).toThrowError( TypeError )
								} else {
									expect( function() { stm.calcDelay( 'abcdefghijklm' ) } ).toThrowError( RangeError )
								}
							} else {

								if ( typeof newVal !== 'number' ) {
									expect( function() { stm.calcDelay( 'abc.,2' ) } ).toThrowError( TypeError )
								} else {
									expect( function() { stm.calcDelay( 'abc.,2' ) } ).toThrowError( RangeError )
								}
							}

							custom[ propName ] = oldVal;
							stm.resetSlowStart();

						}  // end for every property
					}  // end for every wrong value

				});  // End a value changes to something unexpected `.calcDelay()`

				// --- .resetSlowStart() --- \\
				it( "it should throw an error for `.slowStartDelay` when `.resetSlowStart()` is called.", function () {

					for (let vali = 0; vali < wrongValues.length; vali++) {
						
						let wrongVal = wrongValues[vali];
						for ( let propi = 0; propi < props.length; propi++ ) {

							let propName = props[ propi ],
								oldVal 	 = custom[ propName ];

							oneChangedValue( propName, wrongVal, custom )
							let newVal 	 = custom[ propName ]

							if ( propName !== 'slowStartDelay' ) {
								expect( function() { stm.resetSlowStart(); } ).not.toThrowError()
							} else {
								if ( typeof newVal !== 'number' ) {
									expect( function() { stm.resetSlowStart() } ).toThrowError( TypeError )
								} else {
									expect( function() { stm.resetSlowStart() } ).toThrowError( RangeError )
								}
							}

							custom[ propName ] = oldVal;
							stm.resetSlowStart();

						}  // end for every property
					}  // end for every wrong value

				});  // end `.resetSlowStart()`

			});  // end values get changed to something invalid

		});  // End with valid values

	});  // End with-argument constructor

});  // End StringTime
