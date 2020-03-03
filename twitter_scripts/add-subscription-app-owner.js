const request = require('request-promise');

require('dotenv').config();

const ENVIRONMENT = process.env.TWITTER_WEBHOOK_ENV;
const TWITTER_OAUTH = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

var request_options = {
  url: `https://api.twitter.com/1.1/account_activity/all/${ENVIRONMENT}/subscriptions.json`,
  oauth: TWITTER_OAUTH,
  resolveWithFullResponse: true
};

request.post(request_options).then(function (response) {
  console.log('HTTP response code:', response.statusCode);

  if (response.statusCode == 204) {
    console.log('Subscription added.');
  }
}).catch(function (response) {
  console.log('Subscription was not able to be added.');
  console.log('- Verify environment name.');
  console.log('- Verify "Read, Write and Access direct messages" is enabled on apps.twitter.com.');
  console.log('Full error message below:');
  console.log(response.error);
});
