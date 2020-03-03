const request = require('request-promise');
const { getBearerToken } = require('./auth.js');

getBearerToken().then(function (bearer_token) {

  // request options
  var request_options = {
    url: 'https://api.twitter.com/1.1/account_activity/all/subscriptions/count.json',
    auth: {
      'bearer': bearer_token
    }
  };

  request.get(request_options).then(function (body) {
    console.log(body);
  });
});