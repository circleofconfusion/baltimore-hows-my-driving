'use strict';
require('dotenv').config();
const Twit = require('twit');
const crypto = require('crypto');
const { getViolationData, getDataByYear } = require('./open-baltimore');
const { generateAnnualSummaryTweets, generateViolationSummaries, generateViolationTweets, matchLicensePlates } = require('./text-parsing');

module.exports = {
  twitterWebhook,
  crcResponse
}

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

async function twitterWebhook(event) {
  const body = JSON.parse(event.body);
  if (respondToTweet(body)) {
    const mention = body.tweet_create_events[0];
    
    const [ state, tag ] = matchLicensePlates(mention.text);
    const mentionId = mention.id_str;

    // violation data
    const violationData = await getViolationData(state, tag);
    const violations = generateViolationSummaries(violationData);
    const violationTweets = generateViolationTweets(state, tag, violations);

    // annual summary data
    const annualSummaryData = await getDataByYear(state, tag);
    const annualSummaryTweets = generateAnnualSummaryTweets(state, tag, annualSummaryData);

    // put all the tweets together
    const tweets = [ ...violationTweets, ...annualSummaryTweets ];

    // start with replying to original tweet, 
    // and update this value for each subsequent tweet
    let replyToId = mentionId;

    const tweetsAsyncIterable = {
      [Symbol.asyncIterator]() {
        return {
          next() {
            if (tweets.length) {
              return new Promise((resolve, reject) => {
                T.post(
                  'statuses/update',
                  {
                    status: tweets.shift(),
                    in_reply_to_status_id: replyToId,
                    auto_populate_reply_metadata: true
                  },
                  (err, data) => {
                    if (err) {
                      console.error(err);
                      reject(err);
                    } else {
                      resolve({
                        value: data.id_str,
                        done: false
                      });
                    }
                  }
                );
              });
            } else {
              return Promise.resolve({done: true});
            }
          }
        };
      }
    }

    for await (let id_str of tweetsAsyncIterable) {
      replyToId = id_str;
    }

    return { statusCode: 200, body: '' };
  }
}

async function crcResponse(event) {
  const { crc_token } = event.queryStringParameters;
  const response_token = 'sha256=' + crypto.createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET).update(crc_token).digest('base64');
  return {
    statusCode:200,
    body: JSON.stringify({ response_token })
  }
}

function respondToTweet(tweet) {
  if (
    tweet.hasOwnProperty('user_has_blocked') &&
    tweet.hasOwnProperty('tweet_create_events') && 
    tweet.tweet_create_events.length >= 1
  ) {
    return true;
  } else {
    return false;
  }
}
