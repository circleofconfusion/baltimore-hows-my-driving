'use strict';
require('dotenv').config();
const Twit = require('twit');
const crypto = require('crypto');
const https = require('https');
const { generateViolationSummaries, generateTweets, matchLicensePlates } = require('./text-parsing');

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

module.exports = {
  twitterWebhook,
  crcResponse
}

async function twitterWebhook(event) {
  const body = JSON.parse(event.body);
  if (body.tweet_create_events && body.tweet_create_events.length > 0) {
    const mention = body.tweet_create_events[0];

    const mentionId = mention.id_str;
    const [ state, tag ] = matchLicensePlates(mention.text);
    const data = await getData(state, tag);
    const violations = generateViolationSummaries(data);
    const tweets = generateTweets(state, tag, violations);

    // start with replying to original tweet, 
    // and update this value for each subsequent tweet
    let replyToId = mentionId;

    await new Promise(resolve => {
      T.post(
        'statuses/update',
        { 
          status: tweets[0],
          in_reply_to_status_id: replyToId,
          auto_populate_reply_metadata: true
        },
        (err, data, reply) => {
          console.log(reply)
          resolve(reply);
        });
    });
    
    // Loop through and POST all the generated tweets, updating the replyToId each time.
    // tweets.forEach(async (tweetText) => {
    //   console.log("replyToId 1", replyToId);
    //   replyToId = await new Promise((resolve, reject) => {
    //     T.post(
    //       'statuses/update', 
    //       {
    //         status: tweetText,
    //         in_reply_to_status_id: replyToId,
    //         auto_populate_reply_metadata: true
    //       },
    //       (err, data, reply) => {
    //         console.log(mentionId, replyToId)
    //         if (err) {
    //           console.log(err);
    //           reject();
    //         } else {
    //           console.log(reply);
    //           resolve(data.id_str);
    //         }
    //       });
    //   });
    //   console.log("replyToId 2", replyToId);
    // });
    console.log('returning')
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

async function getData(state, tag) {
  return new Promise((resolve, reject) => {
    https.get(
      `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=violcode,count(violcode) as count&$where=tag='${tag}' AND state='${state}'&$group=violcode`,
      (response) => {
        let data = '';

        response.on('data', chunk => { data += chunk });
        response.on('end', () => {
          resolve(JSON.parse(data));
        });
      }
    ).on('error', err => { 
      reject(Error(err))
    });
  });
}
