var request = require("request"),
	natural = require('natural'),
	cheerio = require("cheerio"),
	Entities = require("html-entities").AllHtmlEntities,
	striptags = require('striptags'),
	fs = require('fs'),
	Q = require('q');


var isCapital = function(c) {
	return (c.charCodeAt(0) >=65 && c.charCodeAt(0) <=90);
}

/**
* A word is a candidate for a movie name if it starts with a capital letter or
* has & (like Pain & Gain) or if it is a numeric value (like 1984) or if it represents
* a year with brackets.
**/
var isCandidate = function (word, isFirstWord) {
	if(!word) return;
	var commonWords = ['&', 'and', 'in', 'a', 'the', 'of', 'on'];
	var c = word.charAt(0);
	var acceptableCommonWord = false;
	if (!isFirstWord) acceptableCommonWord = (commonWords.indexOf(word) !== -1);
	return ( acceptableCommonWord || isCapital(c) || !!parseInt(c) || word.match(/\([0-9]+\)/) ); 
}

/**
* using some pre-defined selectors, check if selector exists in page
* and extract text from the page,
* decode entities
* remove html tags and return text
**/
var extractContent = function(text) {
	var selectors = ['.blog-body', 'article', '.post'];
	var $ = cheerio.load(text);
	var entities = new Entities();
	var i = 0;
	var currentSelector = null;
	selectors.forEach(function(selector){
		if ($(selector).length != 0) {
			if(currentSelector) console.log('WARNING: more than one selector found in page');
			currentSelector = selector;
		}
	});
	if(!currentSelector) currentSelector = 'body';
	var content = $(currentSelector).html()
	content = striptags(content);
	content =  entities.decode(content);
	return content;	
}

var extractTokens = function(text) {
	var regexp = new RegExp(/[a-zA-Z0-9\'\`\’\&\.\(\)\,]+/g);
	var tokens = text.match(regexp);
	return tokens; 
}

exports.getCandidateTokens = function(url) {
	if(!url) {console.log('No URL provided!'); return;}
	var defered = Q.defer();
	request(url, function (error, response, body) {
		if (!error) {
			var content = extractContent(body);
			var tokens = extractTokens(content);
			var potentialMovieNames = [];
			var index = 0;
			while(index < tokens.length) {
				if( !isCandidate(tokens[index], true) ) {
					index++;
					continue;
				}
				var candidate = tokens[index];
				while(isCandidate(tokens[index + 1], false)) {
					candidate += " " + tokens[index+1];
					index++;
				}
				potentialMovieNames.push(candidate);
				index++;
			}
			stopwords = fs.readFileSync('./stopwords.txt', 'utf-8');
			stopwords = stopwords.split(',');
			potentialMovieNames = potentialMovieNames.filter(function(name){
				return stopwords.indexOf(name.toLowerCase()) == -1; 
			});
			defered.resolve(potentialMovieNames);
		} else {
			console.log("We’ve encountered an error: " + error);
		}
	});
	return defered.promise;
}
