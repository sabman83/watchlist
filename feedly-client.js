var Q = require('q'),
scraper = require('./scraper.js'),
Feedly = require('feedly'),
tagNames = null,
urls = [];

var feedlyConfig = require('./feedly.json');
var feedly = new Feedly({
	base: 'http://sandbox.feedly.com/',
	client_id: feedlyConfig.client_id,
	client_secret: feedlyConfig.client_secret,
	port: 8080
});

var defered = Q.defer();

var handleTaggedEntries = function(error, result){
	if(error) {
		console.log('Error fetching tagged entries', error);
		return;
	}
	var tags = Object.keys(result.taggedEntries);
	var toWatch = tags.find(function(entry){ return !!entry.match(tagName);});
	var entries = result.taggedEntries[toWatch];
	var promises = [];
	entries.forEach(function(entry){
		promises.push(feedly.shorten(entry, handleEntry));
	});
	Q.allSettled(promises).then(function(results){
		defered.resolve(urls);
	});
}

var handleEntry = function(error, result){
	if(error) {console.log('Error getting shortened url', error)}
	urls.push(result.longUrl);
}

exports.getUrlsFor = function(tag) {
	if(!tag) {
		console.log('tag name is required');
		return;
	}
	tagName = tag;
	feedly.tags(handleTaggedEntries);
	return defered.promise;
}
