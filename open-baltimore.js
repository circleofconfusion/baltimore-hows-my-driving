const https = require('https');
const humps = require('humps');

module.exports = {
  getViolationData,
  getDataByYear,
  getMonthlyRecords
};

async function getViolationData(state, tag) {
  const url = `https://services1.arcgis.com/UWYHeuuJISiGmgXx/arcgis/rest/services/Parking_Fines/FeatureServer/0/query?where=Tag = '${tag}' AND State = '${state}'&outFields=ViolCode&groupByFieldsForStatistics=ViolCode&outStatistics=[{"statisticType":"count","onStatisticField":"ViolCode","outStatisticFieldName":"Count"}]&f=json`;
  return getOpenBaltimoreData(url);
}

async function getDataByYear(state, tag) {
  const url = `https://services1.arcgis.com/UWYHeuuJISiGmgXx/arcgis/rest/services/Parking_Fines/FeatureServer/0/query?where=Tag = '${tag}' AND State = '${state}'&groupByFieldsForStatistics=Extract(Year from ViolDate)&outStatistics=[{"statisticType":"count","onStatisticField":"Extract(Year from ViolDate)","outStatisticFieldName":"Count"},{"statisticType":"sum","onStatisticField":"ViolFine","outStatisticFieldName":"AnnualFines"}]&f=json`;
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
            const parsedData = convertEsriData(JSON.parse(data));
            resolve(parsedData);
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

/**
 * Parses what's essentially tabular data coming from ESRI's odd geo-oriented format.
 * @param {Object} data Raw data coming from Open Baltimore/ESRI
 */
function convertEsriData(data) {
  if (data.features) {
    const simplifiedFeatures = data.features.map(f => f.attributes);
    return humps.camelizeKeys(simplifiedFeatures);
  } else {
    return [];
  }
}