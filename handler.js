'use strict';
require('dotenv').config();
const Twit = require('twit');
const crypto = require('crypto');
const { getViolationData, getDataByYear } = require('./open-baltimore');
const { 
  generateNoViolationsTweet,
  generateAnnualSummaryTweets,
  generateViolationSummaries,
  generateViolationTweets,
  matchLicensePlates
} = require('./text-parsing');
const { publishTweet } = require('./twitter');

module.exports = {
  twitterWebhook,
  crcResponse
};

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

async function twitterWebhook(event) {
  if (!verifySignature(event)) {
    return {
      statusCode: 401
    };
  }
  console.log('event', event);
  const body = JSON.parse(event.body);
  console.log('body', body);
  if (respondToTweet(body)) {
    console.log('extended_tweet', body.tweet_create_events[0].extended_tweet);
    console.log('entities', body.tweet_create_events[0].entities);
    const mention = body.tweet_create_events[0];

    let tweetText;

    if (mention.extended_tweet && mention.extended_tweet.full_text) {
      tweetText = mention.extended_tweet.full_text;
    } else {
      tweetText = mention.text;
    }

    const plateMatches = matchLicensePlates(tweetText);

    console.log('plateMatches', plateMatches);
    
    await Promise.all(plateMatches.map(async ([state, tag]) => {
      console.log(state, tag);
      const mentionId = mention.id_str;

      let tweets = [];
      const violationData = await getViolationData(state, tag);

      if (violationData.length > 0) {    
        const violations = generateViolationSummaries(violationData);
        const violationTweets = generateViolationTweets(state, tag, violations);

        // annual summary data
        const annualSummaryData = await getDataByYear(state, tag);
        const annualSummaryTweets = generateAnnualSummaryTweets(state, tag, annualSummaryData);

        // put all the tweets together
        tweets = [ ...violationTweets, ...annualSummaryTweets ];
      } else {
        tweets = generateNoViolationsTweet(state, tag);
      }

      // start with replying to original tweet, 
      // and update this value for each subsequent tweet
      let replyToId = mentionId;

      const tweetsAsyncIterable = {
        [Symbol.asyncIterator]() {
          return {
            next() {
              if (tweets.length) {
                return publishTweet(tweets.shift(), replyToId);
              } else {
                return Promise.resolve({done: true});
              }
            }
          };
        }
      };

      for await (let id_str of tweetsAsyncIterable) {
        replyToId = id_str;
      }

      return Promise.resolve();
    }));

    return { statusCode: 200, body: '' };
  }
}

async function crcResponse(event) {
  const { crc_token } = event.queryStringParameters;
  const response_token = 'sha256=' + crypto.createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET).update(crc_token).digest('base64');
  return {
    statusCode: 200,
    body: JSON.stringify({ response_token })
  };
}

function respondToTweet(tweet) {

  if (
    Object.prototype.hasOwnProperty.call(tweet, 'user_has_blocked') &&
    Object.prototype.hasOwnProperty.call(tweet, 'tweet_create_events') && 
    tweet.tweet_create_events.length >= 1
  ) {
    return true;
  } else {
    return false;
  }
}

function verifySignature(event) {
  const signature = event.headers['X-Twitter-Webhooks-Signature'];
  const body = event.body;
  const hmac = 'sha256=' + crypto.createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET).update(body).digest('base64');

  return signature === hmac;
}
