const { VIOLATION } = require('./constants');
const sprintf = require('sprintf-js').sprintf;

module.exports = {
    matchLicensePlates,
    generateViolationSummaries,
    generateViolationTweets,
    generateAnnualSummaryTweets,
    generateNoViolationsTweet
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

function generateAnnualSummaryTweets(state, tag, data) {
    const heading = `#${state}_${tag} Fines by Year`
    const tableHeading = 'Year Viols Fines';
    let tweets = [
        `${heading}:\n\n${tableHeading}`
    ];
    let tweetIndex = 0;
    let violationsTotal = 0;
    let finesTotal = 0;
    // individual lines of summary table
    data.forEach(d => {
        const line = sprintf("\n%' 4s %' 6s %' 5s", d.year, d.count, d.annualFines);
        if ((tweets[tweetIndex] + line).length <= 280) {
            tweets[tweetIndex] += line;
        } else {
            tweetIndex++;
            tweets[tweetIndex] = `${heading} Cont'd:\n\n${tableHeading}${line}`;
        }
        violationsTotal += +d.count;
        finesTotal += + d.annualFines;
    });
    // total lines
    const totalLines = sprintf("\n     ===========\n     %' 6d $%' 5d", violationsTotal, finesTotal);
    if ((tweets[tweetIndex] + totalLines).length < 280) {
        tweets[tweetIndex] += totalLines;
    } else {
        tweetIndex++;
        tweets[tweetIndex] = `${heading} Cont'd:\n${totalLines}`;
    }
    return tweets;
}

function generateNoViolationsTweet(state, tag) {
    return [ `#${state}_${tag} has no known violations in Baltimore 👍` ];
}