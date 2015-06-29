var Q = require('q'),
scraper = require('./scraper.js');


var defered = Q.defer();

defered.promise.then(function(value){
	console.log(value);
});

scraper.getCandidateTokens('http://www.artofthetitle.com/title/the-pride-and-the-passion/',defered);
