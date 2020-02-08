'use strict';
require('dotenv').config();
const { NO_TAG } = require('./tag-special');
const {
  getMonthlyRecords
} = require ('./open-baltimore');

module.exports = {
  getPrevMonthStats
};

async function getPrevMonthStats() {
  const now = new Date();
  const month = now.getMonth();
  // JS months start with 0, and SODA months start with 1.
  // JS month will be equivalent of previous month.
  // If 0, set to the previous December.
  const monthToSearch = month > 0 ? month : 12; 
  const year = now.getFullYear();
  const yearToSearch = monthToSearch > month ? year - 1 : year;
    
  const rawData = await getMonthlyRecords(yearToSearch, monthToSearch);
  const totalFines = rawData.reduce((acc, val) => acc += +val.violFine, 0);
  const worst = worstTags(countByTag(rawData.filter(d => !NO_TAG.includes(d.tag))));
  return Promise.resolve({
    month: monthToSearch,
    year: yearToSearch,
    numViolations: rawData.length,
    totalFines,
    worst,
    violationsTotals: groupByViolation(rawData)
  });
}

function groupByViolation(data) {
  const groupObj = data.reduce((acc, val) => {
    const violCode = val.violCode;
    if (Object.prototype.hasOwnProperty.call(acc, violCode)) {
      acc[violCode].count += 1;
    } else {
      acc[violCode] = {
        violCode,
        count: 1
      };
    }
    return acc;
  }, {});

  return Object.values(groupObj)
    .sort((a, b) => {
      if(a.violCode > b.violCode) return 1;
      else if (a.violCode === b.violCode) return 0;
      else return -1;
    });
}

function countByTag(data) {
  const groupObj = data.reduce((acc, val) => { 
    const plate = `${val.state} ${val.tag}`.toUpperCase();
    if (Object.prototype.hasOwnProperty.call(acc, plate)) {
      acc[plate].count += 1;
      acc[plate].totalFines += +val.violFine;
    } else {
      acc[plate] = {
        plate: plate,
        count: 1,
        totalFines: +val.violFine
      };
    }
    return acc;
  }, {});

  return Object.values(groupObj);
}

function worstTags(data) {
  data.sort((a, b) => {
    if (a.count > b.count) return -1;
    else if (a.count === b.count) return 0;
    else return 1;
  });

  const worstTags = [ data[0] ];

  for (let i = 1; i < data.length; ++i) {
    if (data[i].count === worstTags[worstTags.length - 1]) {
      worstTags.push(data[i]);
    } else {
      break; // We've broken the tie, stop looping
    }
  }

  return worstTags;
}
