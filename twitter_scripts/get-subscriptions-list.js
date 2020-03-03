const request = require('request-promise');
const auth = require('./auth.js');

require('dotenv').config();

const ENVIRONMENT = process.env.TWITTER_WEBHOOK_ENV;


auth.getBearerToken().then(function (bearerToken) {

  var request_options = {
    url: `https://api.twitter.com/1.1/account_activity/all/${ENVIRONMENT}/subscriptions/list.json`,
    auth: {
      bearer: bearerToken
    }
  };

  request.get(request_options).then(function (body) {
    console.log(body);
  });
});