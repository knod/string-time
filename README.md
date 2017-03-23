# string-time
Calculates how long a string should stay visible using the characteristics of that string, corresponding millisecond values, and other data

---------
## INSTALLING FOR BROSWER OR NODE

### If node is already installed on your system (installing for development)
```
npm install --save string-time
```

### If you don't have node installed
Just download the zip from github or fork and clone the repo

### For development with node
See [Contributing](#contributing)

---------
## EXAMPLE

### In the Browser
```js
var settings = {
		_baseDelay: 	150,  // based on 400 wpm (1/(400/60)*1000)
		slowStartDelay: 3,
		sentenceDelay: 	2,
		otherPuncDelay: 5,
		numericDelay: 	3.2,
		shortWordDelay: 1.3,
		longWordDelay: 	1.5,
	}

var stm 	= new StringTime( settings ),
	delay1 	= stm.calcDelay( 'gone.', false ),  	// 300
	delay1 	= stm.calcDelay( 'gone.' ),  		// 300
	delay2 	= stm.calcDelay( 'gone.' );  		// 200 (see description below for explanation)
```

### With Node
```js
var STm 	 = require('dist/String-Time'),
	settings = {
		_baseDelay: 	150,  // based on 400 wpm
		slowStartDelay: 3,
		sentenceDelay: 	2,
		otherPuncDelay: 5,
		numericDelay: 	3.2,
		shortWordDelay: 1.3,
		longWordDelay: 	1.5,
	};

var stm 	= new STm( settings ),
	delay1 	= stm.calcDelay( 'gone.', false ),  	// 600
	delay1 	= stm.calcDelay( 'gone.' ),  		// 600
	delay2 	= stm.calcDelay( 'gone.' );  		// 400 (see description below for explanation)
```

---------
## DESCRIPTION

Meant to be used with Readerly's other modules, this object is tricky, and very tangled up with the code that creates and uses it. The creator of a `StringTime` instance (`stm`) passes in a reference to an object which can contain these used properties:

Base delay to start with:

- _baseDelay (>=0, usually based on desired words per minute)

Delay modifiers/multipliers to change the base delay:

- slowStartDelay (>0)
- sentenceDelay (>0)
- otherPuncDelay (>0)
- shortWordDelay (>0)
- longWordDelay (>0)
- numericDelay (>0)

When `stm.calcDelay(str, bool)` is called, it tests the properties of the string `str`. It then uses the base delay multiplied by whichever modifiers are relevant to return how many milliseconds a string should be displayed in the RSVP app.

StringTime depends on `settings`'s properties repeatedly, so it shouldn't be destroyed.

There are two other important features.

1. The `slowStartDelay` property lets `stm` start the RSVP reader slowly, then lets it gain speed. You can reset to your currently stored slow starting/warmup speed using `stm.resetSlowStart()`.
2. Passing a value of `true` as the optional second argument to `stm.calcDelay()` freezes the progress of that speeding up. In future, it may use that boolean to reset the slow starting speed.

The functionality to add more delay modifiers after the fact hasn't been created yet.

---------
## LICENSE

MIT

---------
## ISSUES

Issues reports welcome at [https://github.com/knod/string-time/issues](https://github.com/knod/string-time/issues).

---------
## CONTRIBUTING

Pull requests welcome, but please test your code befor making a pull request.

### Install the project for development with node
Fork the repo and clone it to your machine
Open the string-time folder in your terminal (or navigate to it in the terminal using `cd`) and do

```
npm install
```

That should install `jasmine` for testing. 

### Testing
```
npm test
```

You can then run `npm test` whenever you want in order to make sure that the code passes all existing tests. If more tests are needed to support new functionality, please write them. Check out the `jasmine` API for more details on what you can do. If you're not sure how to write those tests, feel free to [file an issues](https://github.com/knod/string-time/issues)

---------
## TODO

- Base an internal `baseDelay` on external `.wpm`, converting on the fly? Needs recalculating every time.
- Build list of multipliers and testing functions then make that list modifiable
