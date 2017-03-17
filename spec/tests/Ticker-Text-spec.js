describe( "TickerText,", function () {

	var TT = require('../../dist/Ticker-Text.js');


	// ======== UNEXPECTED VALUES ========



	// ======== EXPECTED VALUES ========
	describe( "when called without an argument, its instance", function () {


		var tt 		 = new TT(),
			defaults = tt.calcDelay( 'abcd' );


		beforeEach(function() {
			tt.resetSlowStart();
		});


		// --- Basics --- \\
		it( "should return a number.", function () {
			expect( typeof defaults ).toEqual( 'number' );
		});

		it( "should use its default settings.", function () {
			expect( tt._settings ).toBe( tt.defaults );
			expect( defaults ).toEqual( 800 );
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

		describe( ", when its .resetSlowStart() method is used,", function () {

			var one = tt.calcDelay( 'abcd' ),
				two = tt.calcDelay( 'abcd' ),
				reset = tt.resetSlowStart(),
				three = tt.calcDelay( 'abcd' );

			it( "should refresh the slow start delay value.", function () {
				expect( tt._tempSlowStart ).toEqual( tt.defaults.slowStartDelay );
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
			
			describe( "none,", function () {
				it( "should return 800.", function () {
					expect( defaults ).toEqual( 800 );
				});
			});
			
			describe( "less than 3 characters,", function () {

				var val = 'ab';
				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return 1040.", function () {
					expect( tt.calcDelay( val ) ).toEqual( 1040 );
				});

				val = 'a';
				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return 1040.", function () {
					expect( tt.calcDelay( val ) ).toEqual( 1040 );
				});

				// ??: Should return 0?
				val = '';
				// expect( function() {return val < 3} ).toEqual( true );  // Testing test
				it( "should return 1040.", function () {
					expect( tt.calcDelay( val ) ).toEqual( 1040 );
				});

			});  // End < 3 characters
			
			describe( "more than 8 characters,", function () {
				it( "should return 1200.", function () {
					expect( tt.calcDelay('abcdabcda') ).toEqual( 1200 );
				});
			});  // End > 8 characters

			describe( "one or more of '.', '!', and/or '?' ,", function () {

				it( "should return 4000.", function () {
					expect( tt.calcDelay( 'abcd.' ) ).toEqual( 4000 );
				});

				it( "should return 4000.", function () {
					expect( tt.calcDelay( 'abc.d..' ) ).toEqual( 4000 );
				});

				it( "should return 4000.", function () {
					expect( tt.calcDelay( 'abc.d.!' ) ).toEqual( 4000 );
				});

				it( "should return 4000.", function () {
					expect( tt.calcDelay( 'abc.d.?' ) ).toEqual( 4000 );
				});

			});  // End sentence

			// describe( "one or more non-sentence-ending punctuation character ,", function () {
			describe( "one or more '\"'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd"' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( '"abcd"' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more \"'\"'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( "abcd'" ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( "'abcd'" ) ).toEqual( 2000 );
				});
			});

			describe( "one or more '”'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd”' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( '”abcd”' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more '’'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd’' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( '’abcd’' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more '('", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd(' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( '(abcd(' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more ')'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd)' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( ')abcd)' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more ':'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd:' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( ':abcd:' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more ';'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd;' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( ';abcd;' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more ','", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd,' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( ',abcd,' ) ).toEqual( 2000 );
				});
			});

			describe( "one or more '_'", function () {
				it( "should return 2000.", function () {
					expect( tt.calcDelay( 'abcd_' ) ).toEqual( 2000 );
					tt.resetSlowStart();
					expect( tt.calcDelay( '_abcd_' ) ).toEqual( 2000 );
				});
			});

			// TODO: Add more punctuation and more cases
			// End non-sentence ending punctuation


		});  // End string characteristics

	});  // End expected instance values

});  // End hyperaxe


describe( "", function () {
	xit( "test template", function () {});
});