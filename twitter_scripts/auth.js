const request = require('request');

require('dotenv').config();

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

module.exports = {
  getBearerToken,
  getOauth
};

function getBearerToken() {
  // construct request for bearer token
  const requestOptions = {
    url: 'https://api.twitter.com/oauth2/token',
    method: 'POST',
    auth: {
      user: CONSUMER_KEY,
      pass: CONSUMER_SECRET
    },
    form: {
      'grant_type': 'client_credentials'
    }
  };

  return new Promise (function (resolve, reject) {
    request(requestOptions, function(error, response) {
      if (error) {
        reject(error);
      }
      else {
        const jsonBody = JSON.parse(response.body);
        console.log('Bearer Token:', jsonBody.access_token);
        resolve(jsonBody.access_token);
      }
    });
  });
}

async function getOauth() {

}