var Twit = require('twit'); // https://github.com/ttezel/twit

var config = require('./config.js');

// app.twitter.com
var T = new Twit(config);

// Send a scheduled tweet (use Date() in production)
function tweetIt() {
	var r = Math.floor(Math.random() * 100);
	var post_params = {
		status: 'this is a scheduled tweet. pseudo random numbers are used to avoid duplicate messages (twitter compliance issues): ' + r // this creates a the statuses{} seen in the response body
	};

	T.post('statuses/update', post_params, tweeted); // triggers event when data has been returned from the API

	function tweeted(err, data, response) {
		if (err) {
			return err;
		} else {
			console.log('\n tweet sent: ', post_params.status);
		}
	}
}

// autogenerate tweets at a certain interval
tweetIt();
setInterval(function() {
	tweetIt()
}, 60 * 60 * 1000);

// get a certain number of  tweets about a certain topic
function gotTweetData() {

	// additional params to modify the search https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
	var get_params = {
		q: 'chatbots since:2011-07-11', // w/ optional time specification 'chatbots since:2011-07-11'
		count: 1 // mumber of messages meeting criteria above
	};

	T.get('search/tweets', get_params, getTweetsByHashtag)

	function getTweetsByHashtag(err, data, response) {
		if (err) {
			return err;
		}
		var tweets = data.statuses;
		for (var i = 0; i < tweets.length; i++) {
			console.log('\n search query: ' + get_params.q + '\n quantity requested: ' + get_params.count + '\n tweets received: ' + tweets[i].text + '\n');
		}
	}
}

gotTweetData()

// set up user stream and initialise when account is followed on twitter
var stream = T.stream('user');

// follow could be replaced w/ follow, favorite, retweet, tweet, etc look up the twitter API streaming section
// assigns a callback called "followed" to the event called "follow"
stream.on('follow', followed);

function followed(eventMsg) { // stream.on() calls the function followed
	var name = eventMsg.source.name;
	var screenName = eventMsg.source.screen_name;
	console.log('\n this is the function "followed(eventMsg)" and it is called by stream.on("follow")');
	follow_response(screenName);
}

// send a tweet in response to a event, like when a user follows the twitter account
function follow_response(screenName) {
	console.log('\n --> this is the "follow_response()" function call"');

	var post_params = {
		status: 'Hello, ' + screenName + '. Thank you for following me!'
	};

	function new_follower(err, data, response) {
		if (err) {
			return err;
		} else {
			console.log('event response sent: ', post_params.status);
		}
	}

	T.post('statuses/update', post_params, new_follower); // triggers new_follower_response_tweet(), sends post_params as the  payload
}

// respond to a 3rd party tweet event
function tweet_response(data) {
	console.log('\n this is "follow_response()" "');
	var post_params = {
		status: 'Hello, ' + data + '. This is a contextual response to your tweet'
	};

	T.post('statuses/update', post_params, tweeted); // triggers tweeted(), sends post_params payload

	function tweeted(err, data, response) {
		if (err) {
			return err;
		} else {
			console.log('event response sent: ', post_params.status);
		}
	}
}

// reply whenever another account tweets to this account
var stream = T.stream('user');
stream.on('tweet', tweetEvent);

function tweetEvent(eventMsg) {

	var replyTo = eventMsg.in_reply_to_screen_name;
	var text = eventMsg.text;
	var from = eventMsg.user.screen_name;
	console.log('tweet received from another account: ', text);


	if (replyTo == 'dpf205') {
		var newTweet = '\n this is a response to a tweet from ' + '@' + from;
		replyTweet(newTweet);
	}
}

function replyTweet(tweetText) {
	var post_params = {
		status: tweetText
	};

	T.post('statuses/update', post_params, logTweet);
	function logTweet(err, data, response) {
		if (err) {
			return err;
		} else {
			console.log('\n tweet sent from replier bot: ', post_params.status);
		}
	}
}
