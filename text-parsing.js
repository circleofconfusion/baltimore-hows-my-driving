const { VIOLATION } = require('./constants');

module.exports = {
    matchLicensePlates,
    generateViolationSummaries,
    generateViolationTweets
}

function matchLicensePlates(text) {
    return text.match(/\b[A-Za-z]{2}\:[A-Za-z0-9]+\b/)[0].toUpperCase().split(":");
}

function generateViolationSummaries(data) {
    return data.map(d => `${d.count} ${VIOLATION[d.violcode]}`);
}

function generateViolationTweets(state, tag, violations) {
    const heading = `#${state}_${tag} Violations`
    let tweets = [
        `${heading}:\n`
    ];
    let tweetIndex = 0;
    violations.forEach(v => {
        if ((tweets[tweetIndex] + `\n${v}`).length <= 280) {
            tweets[tweetIndex] += `\n${v}`;
        } else {
            tweetIndex++;
            tweets[tweetIndex] = `${heading} Cont'd:\n\n${v}`;
        }
    });
    return tweets;
}