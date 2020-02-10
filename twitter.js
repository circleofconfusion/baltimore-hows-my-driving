'use strict';

require('dotenv').config();
const Twit = require('twit');
const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

module.exports = {
  publishTweet
};

async function publishTweet(text, inReplyToId) {
  const tweetObj = {
    status: text,
  };
  
  if (inReplyToId) {
    tweetObj.in_reply_to_status_id = inReplyToId;
    tweetObj.auto_populate_reply_metadata = true;
  }

  return new Promise((resolve, reject) => {
    T.post(
      'statuses/update',
      tweetObj,
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
}