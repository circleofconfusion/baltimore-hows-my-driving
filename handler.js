'use strict';
require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const { generateViolationSummaries, generateTweets, matchLicensePlates } = require('./text-parsing');

module.exports = {
  twitterWebhook,
  crcResponse
}

async function twitterWebhook(event) {
  const [ state, tag ] = matchLicensePlates(JSON.parse(event.body).tweet_create_events[0].text);
  const data = await getData(state, tag);
  const violations = generateViolationSummaries(data);
  const tweets = generateTweets(state, tag, violations);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: tweets
    })
  };
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
