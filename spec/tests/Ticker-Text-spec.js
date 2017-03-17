describe( "TickerText,", function () {

	var TT = require('../../dist/Ticker-Text.js');

	var tt;
	beforeEach(function() { tt = new TT() });


	// ======== !!! NOTE !!! ========
	// If `.defaults` are changed, these results are going to change...



	// ======== UNEXPECTED VALUES ========



	// ======== EXPECTED VALUES ========
	describe( "when called without an argument, its instance", function () {

		// --- Basics --- \\
		it( "should return a number.", function () {
			expect( typeof tt.calcDelay( 'abcd' ) ).toEqual( 'number' );
		});

		it( "should use its default settings.", function () {
			expect( tt._settings ).toBe( tt.defaults );
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

		// TODO: ??: Throw a bad value/type error if the second argument is not a bool or undefined??
		// TODO: ??: Only check for 'true'??
		describe( ", when it's called with `false` as the second argument", function () {
			it( "SHOULD reduce its `._tempSlowStart` value", function () {

				var start = tt._tempSlowStart;
				tt.calcDelay( 'abcd', false );
				expect( tt._tempSlowStart ).toEqual( start/1.5 );

			});
		});

		// TODO: Throw a bad value/type error if the second argument is not a bool or undefined
		describe( ", when it's called WITHOUT a second argument", function () {
			it( "SHOULD reduce its `._tempSlowStart` value", function () {

				var start = tt._tempSlowStart;
				tt.calcDelay( 'abcd' );
				expect( tt._tempSlowStart ).toEqual( start/1.5 );

			});
		});

		describe( ", when it's called WITH `true` as the second argument", function () {
			it( "should NOT reduce its `._tempSlowStart` value", function () {

				var start = tt._tempSlowStart;
				tt.calcDelay( 'abcd', true );
				expect( tt._tempSlowStart ).toEqual( start );

			});
		});


		// --- Expected Instance Values --- \\
		describe( ", given a string with these modifying characteristics:", function () {
			
			var ms;

			// ---- Nothing Special ----
			describe( "none,", function () {
				beforeEach(function() { ms = 800 });
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay( 'abcd' ) ).toEqual( ms );
				});
			});
			
			// ---- Short Word ----
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
			
			// ---- Long Word ----
			describe( "more than 8 characters,", function () {
				beforeEach(function() { ms = 1200 });
				it( "should return " + ms + ".", function () {
					expect( tt.calcDelay('abcdabcda') ).toEqual( ms );
				});
			});  // End > 8 characters

			// ---- Sentence-ender Punctuation ----
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

			// ---- Other Punctuation ----
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


			// ---- Numerical ----

			// ---- Combos of characteristics ----

			// ---- Unexpected Values ----


		});  // End string characteristics

		// ---- Just Once ----
			// ---- Expected Values ----
			// ---- Unexpected Values ----

	});  // End no-argument constructor


	// ---- Custom Settings ----
		// ---- That Change ----

});  // End hyperaxe


describe( "", function () {
	xit( "test template", function () {});
});