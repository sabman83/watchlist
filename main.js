var feedly = require('./feedly-client.js');
var scraper = require('./scraper.js');

feedly.getUrlsFor('to-watch').then(function(result){
	result.forEach(function(url){
		scraper.getCandidateTokens(url).then(function(tokens){
			console.log(tokens);
		}, function(error){
			console.log(error);
		});
	}, function(error){
		console.log(error);
	});
});
