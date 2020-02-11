const { VIOLATION } = require('./constants');
const sprintf = require('sprintf-js').sprintf;
const commaNumber = require('comma-number');

module.exports = {
  matchLicensePlates,
  generateViolationSummaries,
  generateViolationTweets,
  generateAnnualSummaryTweets,
  generateNoViolationsTweet,
  monthlySummaryTweet,
  monthlyByViolationsTweets,
  worstDriverTweets,
  convertToMonospace
};

function matchLicensePlates(text) {
  return text.match(/\b[A-Z]{2}:[A-Z0-9]+\b/i)[0].toUpperCase().split(':');
}

function generateViolationSummaries(data) {
  return data.map(d => `${d.count} ${VIOLATION[d.violcode]}`);
}

function generateViolationTweets(state, tag, violations) {
  const heading = `#${state}_${tag} Violations`;
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
  const heading = `#${state}_${tag} Fines by Year`;
  const tableHeading = convertToMonospace('Year Violations Fines');
  let tweets = [
    `${heading}:\n\n${tableHeading}`
  ];
  let tweetIndex = 0;
  let violationsTotal = 0;
  let finesTotal = 0;
  // individual lines of summary table
  data.forEach(d => {
    const line = convertToMonospace(sprintf('\n%4s %11s %6s', d.year, d.count, d.annualFines));
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
  const totalLines = convertToMonospace(sprintf('\n     ═══════════════════\n     %11d $%5d', violationsTotal, finesTotal));
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

function convertToMonospace(str) {
  let output = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode === 32) {
      // convert to monospace space char
      output += String.fromCodePoint(0x2007);
    } else if (charCode === 0x0024) {
      // convert dollar sign to fullwidth
      output += String.fromCodePoint(0xff04);
    } else if (charCode >= 65 && charCode <= 90) {
      // convert to monospace capital letter
      const blockStart = 0x1d670;
      const offset = charCode - 65; 
      output += String.fromCodePoint(blockStart + offset);
    } else if (charCode >= 97 && charCode <= 122) {
      // convert to monospace lowercase letter
      const blockStart = 0x1d68a;
      const offset = charCode - 97;
      output += String.fromCodePoint(blockStart + offset);
    } else if (charCode >= 48 && charCode <= 57) {
      // convert to monospace digit
      const blockStart = 0x1d7f6;
      const offset = charCode - 48;
      output += String.fromCodePoint(blockStart + offset);
    } else {
      // dunno what this character is, so just pass it on
      output += str[i];
    }
  }

  return output;
}


function monthlySummaryTweet(data) {
  return `Monthly statistics for ${data.month}/${data.year}\n\nTotal Violations: ${commaNumber(data.numViolations)}\nTotal Fines: $${commaNumber(data.totalFines)}`;
}

function monthlyByViolationsTweets(data) {
  const tweetHeading = `Monthly statistics for ${data.month}/${data.year} cont'd\n\n`;
  const tweets = [
    tweetHeading
  ];
  data.violationTotals.forEach(d => {
    const line = `${convertToMonospace(sprintf('%-6d', d.count))} ${VIOLATION[d.violCode]}\n`;
    if (tweets[tweets.length - 1].length + line.length <= 280) {
      tweets[tweets.length - 1] += line;
    } else {
      tweets.push(tweetHeading + line);
    }
  });
  return tweets;
}

function worstDriverTweets(data) {
  const tweetHeading = `Monthly statistics for ${data.month}/${data.year} cont'd\n\n`;
  const tweets = [
    tweetHeading
  ];
  data.worst.forEach(w => {
    const worstPlate = `Worst driver ${w.plate}`;
    tweets[tweets.length - 1] += `${worstPlate}\n${convertToMonospace(sprintf('%-3d', w.count))} violations\nTotal fines: $${w.totalFines}\n`;
    w.violationTotals.forEach(d => {
      const line = `${convertToMonospace(sprintf('%-3s', d.count))} ${VIOLATION[d.violCode]}\n`;
      if (tweets[tweets.length - 1].length + line.length <= 280) {
        tweets[tweets.length - 1] += line;
      } else {
        tweets.push(tweetHeading + worstPlate + line);
      }
    });
  });
  return tweets;
}