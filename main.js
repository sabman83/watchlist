var feedly = require('./feedly-client.js');
var scraper = require('./scraper.js');
var config = require('./config.json');
var moviedb = require('moviedb')(config.tmdb_api_key);
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(40, 10000);
var searchMovie = function(query){
	limiter.removeTokens(1, function(err, remainingRequests){
		console.log(remainingRequests);
		if(remainingRequests <= 0) {console.log('REACHED LIMIT'); return;}
		moviedb.searchMovie({query: query}, function(err, res){
			console.log(err, res);
		});
	});
}

feedly.getUrlsFor('to-watch').then(function(result){
	result.forEach(function(url){
		scraper.getCandidateTokens(url).then(function(tokens){
			console.log(tokens);
			tokens.forEach(function(token){
				searchMovie(token);
			});
		}, function(error){
			console.log(error);
		});
	}, function(error){
		console.log(error);
	});
});
