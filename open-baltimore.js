const https = require('https');

module.exports = {
  getViolationData,
  getDataByYear,
  getMonthlyRecords
};

async function getViolationData(state, tag) {
  const url = `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=violcode,count(violcode) as count&$where=tag='${tag}' AND state='${state}'&$group=violcode`;
  return getOpenBaltimoreData(url);
}

async function getDataByYear(state, tag) {
  const url = `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=date_extract_y(violDate) as year,count(*) as count,sum(violFine) as annualFines&$where=tag='${tag}' AND state='${state}'&$group=year&$order=year`;
  return getOpenBaltimoreData(url);
}

async function getMonthlyRecords(year, month) {
  const url = `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=state,tag,make,violFine,violCode,violDate,date_extract_y(violDate) as year, date_extract_m(violDate) as month&$where=year='${year}' AND month='${month}'&$order=violDate&$limit=100000`;
  return getOpenBaltimoreData(url);
}

async function getOpenBaltimoreData(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      (response) => {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(Error('Failed to retrieve data from Open Baltimore at URL: ' + url + '\nWith Error: ' + err));
          }
        });
      }
    ).on('error', err => {
      reject(Error(err));
    });
  });
}