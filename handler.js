'use strict';
const https = require('https');
const { VIOLATION } = require('./constants');

module.exports.twitterWebhook = async function(event) {
  const [ state, tag ] = parseIncoming(JSON.parse(event.body).text);
  const data = await getData(state, tag);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: textSummary(data)
    })
  };
}

async function getData(state, tag) {
  return new Promise((resolve, reject) => {
    https.get(
      `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=violcode,count(violCode) as count&$where=tag='${tag}' AND state='${state}'&$group=violcode`,
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

function textSummary(data) {
  if (data.length > 0) return data.map(d => `${d.count} ${VIOLATION[d.violcode]} Violations`).join('\n');
  else return "No violations found";
}

function parseIncoming(text) {
  return text.match(/\b[A-Za-z]{2}\:[A-Za-z0-9]+\b/)[0].split(":");
}