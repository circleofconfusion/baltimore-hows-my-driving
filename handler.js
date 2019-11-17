'use strict';
const https = require('https');
const { VIOLATION } = require('./constants');

module.exports.twitterWebhook = async function(event) {
  const data = await getData('MD','ATRAIN')
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: textSummary(data)
    })
  }
}

async function getData(state, tag) {
  return new Promise((resolve, reject) => {

    https.get(
      `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=violcode,count(violCode) as count&$where=tag='${tag}' AND state='${state}'&$group=violcode`,
      (response) => {
        let data = '';

        response.on('data', chunk => { data += chunk });
        response.on('end', () => {
          resolve(data);
        });
      }
    ).on('error', err => { 
      reject(Error(err))
    });
  })
}

function textSummary(data) {
  return JSON.parse(data).map(d => `${d.count} ${VIOLATION[d.violcode]} Violations`).join('\n');
}
