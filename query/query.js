"use strict";

const serverless = require('serverless');
const request = require('request-promise-native');

function byTag(state, tag) {
    const requestOptions = {
        url: `https://data.baltimorecity.gov/resource/2ddy-2uzt.json?$where=tag = '${tag.toUpperCase()}' AND state = '${state.toUpperCase()}'`,
        json: true,
        headers: {
            'User-Agent': 'Request-Promise'
        },
    };

    return request(requestOptions);
}

module.exports.handler = serverless({
    byTag
});