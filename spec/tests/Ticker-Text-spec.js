describe( "When a TickerText instance is created,", function () {

	var TT = require('../../dist/Ticker-Text.js');

	var tt;
	beforeEach(function() { tt = new TT() });


	// ======== !!! NOTE !!! ======== \\
	// If `.defaults` are changed, these results are going to change...



	// ======== NO CONSTRUCTOR ARGUMENTS ======== \\
	describe( "without an argument, that instance's `.calcDelay()`", function () {

		// --- Basics --- \\
		it( "should return a number.", function () {
			expect( typeof tt.calcDelay( 'abcd' ) ).toEqual( 'number' );
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
			expect( tt.defaults ).toEqual( defs );
			expect( tt.calcDelay( 'abcd' ) ).toEqual( 800 );
		});

		it( "should start with a `._tempSlowStart` value equal to its `.defaults.slowStartDelay`.", function () {
			expect( tt._tempSlowStart ).toEqual( tt.defaults.slowStartDelay );  // 5
		});

		describe( ", when called four times in a row with a string that has no other modifiers,", function () {

			it( "should reduce the slow start delay by 1/1.5 each time with a minimum value of 1.", function () {

				var start = tt.defaults.slowStartDelay;

				expect( tt._tempSlowStart ).toEqual( start );  // 5
				
				var faster = tt.calcDelay( 'abcd' );
				expect( faster ).toEqual( 800 );
				expect( tt._tempSlowStart ).toEqual( start/1.5 );  // 3.3333333333333335

				faster = tt.calcDelay( 'abcd' );
				expect( Math.floor( faster ) ).toEqual( 533 );  // 533.3333333333334
				expect( tt._tempSlowStart ).toEqual( start/1.5/1.5 );  // 1.4814814814814816

				faster = tt.calcDelay( 'abcd' );
				expect( Math.floor( faster ) ).toEqual( 355 );  // 355.5555555555556
				expect( tt._tempSlowStart ).toEqual( start/1.5/1.5/1.5 );  // 1.4814814814814816

				faster = tt.calcDelay( 'abcd' );
				expect( faster ).toEqual( 240 )
				expect( tt._tempSlowStart ).toEqual( 1 );

			});

		});

		describe( ", when its `.resetSlowStart()` method is used,", function () {

			it( "should refresh the slow start delay value.", function () {

				var one = tt.calcDelay( 'abcd' ),
					two = tt.calcDelay( 'abcd' ),
					reset = tt.resetSlowStart();
				expect( tt._tempSlowStart ).toEqual( tt.defaults.slowStartDelay );

				var three = three = tt.calcDelay( 'abcd' )
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
					expect( tt.calcDelay( 'abcd' ) ).toEqual( ms );
				});
			});
			
			// ---- Short Word ---- \\
			describe( "less than 3 characters,", function () {

				beforeEach(function() { ms = 1040 });

				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'ab' ) ).toEqual( ms );
				});

				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'a' ) ).toEqual( ms );
				});

				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				// ??: Should return 0?
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( '' ) ).toEqual( ms );
				});

			});  // End < 3 characters
			
			// ---- Long Word ---- \\
			describe( "more than 8 characters,", function () {
				beforeEach(function() { ms = 1200 });
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'abcdabcda' ) ).toEqual( ms );
				});
			});  // End > 8 characters

			// ---- Sentence-ender Punctuation ---- \\
			describe( "one or more of '.', '!', and/or '?' ,", function () {
				
				beforeEach(function() { ms = 4000 });

				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'abcd.' ) ).toEqual( ms );
				});

				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'abc.d..' ) ).toEqual( ms );
				});

				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'abc.d.!' ) ).toEqual( ms );
				});

				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'abc.d.?' ) ).toEqual( ms );
				});

			});  // End sentence

			// ---- Other Punctuation ---- \\
			describe( "(other punctuation)", function () {
				
				beforeEach(function() { ms = 2000 });

				describe( "one or more '\"'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd"' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( '"abcd"' ) ).toEqual( ms );
					});
				});

				describe( "one or more \"'\"'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( "abcd'" ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( "'abcd'" ) ).toEqual( ms );
					});
				});

				describe( "one or more '”'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd”' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( '”abcd”' ) ).toEqual( ms );
					});
				});

				describe( "one or more '’'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd’' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( '’abcd’' ) ).toEqual( ms );
					});
				});

				describe( "one or more '('", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd(' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( '(abcd(' ) ).toEqual( ms );
					});
				});

				describe( "one or more ')'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd)' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( ')abcd)' ) ).toEqual( ms );
					});
				});

				describe( "one or more ':'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd:' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( ':abcd:' ) ).toEqual( ms );
					});
				});

				describe( "one or more ';'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd;' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( ';abcd;' ) ).toEqual( ms );
					});
				});

				describe( "one or more ','", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd,' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( ',abcd,' ) ).toEqual( ms );
					});
				});

				describe( "one or more '_'", function () {
					it( "should return " + ms + ".", function () {
						expect( tt.calcDelay( 'abcd_' ) ).toEqual( ms );
						tt.resetSlowStart();
						expect( tt.calcDelay( '_abcd_' ) ).toEqual( ms );
					});
				});

			// TODO: Add more punctuation and more cases
			});  // End non-sentence ending punctuation

			// ---- Numerical ---- \\
			describe( "any numerical characters,", function () {

				beforeEach(function() { ms = 1600 });
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( '12345' ) ).toEqual( ms );
					tt.resetSlowStart();
					expect( tt.calcDelay( 'ab345' ) ).toEqual( ms );
					tt.resetSlowStart();
					expect( tt.calcDelay( '123de' ) ).toEqual( ms );
					tt.resetSlowStart();
					expect( tt.calcDelay( '12cd5' ) ).toEqual( ms );
				});

			});  // End numerical characters

			// ---- Combos of characteristics ---- \\


		});  // End string characteristics


		// ============= ERRORS ============= \\
		// ---- Unexpected Values For First Argument ---- \\
		describe( ", when given no first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay() } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given `null` as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( null ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given `true` as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( true ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given `false` as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( false ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given an object as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( {} ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given an empty array as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( [] ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given an array as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( [1, 2, 3] ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return tt.calcDelay( ['1', '2', '3'] ) } ).toThrowError( TypeError, /first/ )
			});
		});

		describe( ", when given a number as a first argument", function () {
			it( "should throw a TypyError.", function () {
				expect( function(){ return tt.calcDelay( 0 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return tt.calcDelay( 1 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return tt.calcDelay( 5 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return tt.calcDelay( -1 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return tt.calcDelay( 0.1 ) } ).toThrowError( TypeError, /first/ )
				expect( function(){ return tt.calcDelay( -0.1 ) } ).toThrowError( TypeError, /first/ )
			});
		});

		// ---- justOnce, Expected Values ---- \\

		// TODO: Throw a bad value/type error if the second argument is not a bool or undefined
		describe( ", when given NOTHING as a second argument", function () {
			it( "SHOULD reduce its `._tempSlowStart` value", function () {

				var start = tt._tempSlowStart;
				tt.calcDelay( 'abcd' );
				expect( tt._tempSlowStart ).toEqual( start/1.5 );

			});
		});

		describe( ", when given `true` as a second argument", function () {
			it( "should not decrease its `._tempSlowStart`", function () {

				var start = tt._tempSlowStart;
				tt.calcDelay( 'abcd', true );
				expect( tt._tempSlowStart ).toEqual( start );

			});
		});

		// TODO: ??: Throw a bad value/type error if the second argument is not a bool or undefined??
		// TODO: ??: Only check for 'true'??
		describe( ", when given `false` as the second argument", function () {
			it( "SHOULD reduce its `._tempSlowStart` value", function () {

				var start = tt._tempSlowStart;
				tt.calcDelay( 'abcd', false );
				expect( tt._tempSlowStart ).toEqual( start/1.5 );

			});
		});

		// ---- justOnce, Unexpected Values ---- \\

		describe( "should give a TypeError", function () {

			it( "when given `null` as a second argument", function () {
				expect( function(){ return tt.calcDelay( 'abcd', null ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given an object as a second argument", function () {
				expect( function(){ return tt.calcDelay( 'abcd', {} ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given an empty array as a second argument", function () {
				expect( function(){ return tt.calcDelay( 'abcd', [] ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given an array as a second argument", function () {
				expect( function(){ return tt.calcDelay( 'abcd', [1, 2, 3] ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', ['1', '2', '3'] ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given a number as a second argument", function () {
				expect( function(){ return tt.calcDelay( 'abcd', 0 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', 1 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', 5 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', -1 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', 0.1 ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', -0.1 ) } ).toThrowError( TypeError, /second/ )
			});

			it( "when given a string as a second argument", function () {
				expect( function(){ return tt.calcDelay( 'abcd', '0' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', '1' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', 'abcd' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', '' ) } ).toThrowError( TypeError, /second/ )
				expect( function(){ return tt.calcDelay( 'abcd', '#*' ) } ).toThrowError( TypeError, /second/ )
			});

		});  // End justOnce TypeError

	});  // End no-argument constructor


	// ---- Custom Settings ---- \\
		// ---- That Change ---- \\

});  // End hyperaxe


describe( "", function () {
	xit( "test template", function () {});
});
