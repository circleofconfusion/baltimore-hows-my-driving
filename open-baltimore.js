const https = require('https');

module.exports = {
    getViolationData,
    getDataByYear
}

async function getViolationData(state, tag) {
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
            reject(Error(err));
        });
    });
}

async function getDataByYear(state, tag) {
    return new Promise((resolve, reject) => {
        https.get(
            `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$select=date_extract_y(violDate) as year,count(*) as count,sum(violFine) as annualFines&$where=tag='${tag}' AND state='${state}'&$group=year&$order=year`,
            (response) => {
                let data = '';
                response.on('data', chunk => { data += chunk });
                response.on('end', () => {
                    resolve(JSON.parse(data));
                });
            }
        ).on('error', err => {
            reject(Error(err));
        });
    });
}