'use strict';
require('dotenv').config();
const { NO_TAG } = require('./tag-special');
const Twit = require('twit');
const {
    getMonthlyRecords
} = require ('./open-baltimore')

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
    const yearToSearch = monthToSearch > month ? --year : year;
    
    const rawData = await getMonthlyRecords(yearToSearch, monthToSearch);
    return Promise.resolve({
        numViolations: rawData.length,
        totalFines: rawData.reduce((acc, val) => acc += +val.violFine, 0),
        worst: worstTags(objToArray(countByTag(rawData.filter(d => !NO_TAG.includes(d.tag)))))
    });
}

function countByTag(data) {
    return data.reduce((acc, val) => { 
        const plate = `${val.state} ${val.tag}`.toUpperCase();
        acc.hasOwnProperty(plate) ? acc[plate] += 1 : acc[plate] = 1
        return acc;
    }, {});
}

function objToArray(obj) {
    const arr = [];
    for (let key in obj) {
        arr.push({
            plate: key,
            count: obj[key]
        });
    }
    return arr;
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
