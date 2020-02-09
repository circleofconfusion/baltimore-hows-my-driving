const test = require('ava');
const { VIOLATION } = require('./constants');
const { 
  generateViolationSummaries,
  generateViolationTweets,
  matchLicensePlates,
  generateAnnualSummaryTweets,
  generateNoViolationsTweet,
  convertToMonospace
} = require('./text-parsing');

test('matchLicensePlates will match one license plate', t => {
  const data = matchLicensePlates('@BadDrivingBmore MD:ATRAIN');
  t.deepEqual(['MD', 'ATRAIN'], data);
});

test('generateViolationSummaries should handle no violations', t => {
  t.deepEqual(generateViolationSummaries([]), []);
});

test('generateViolationSummaries should correctly parse a single violation record', t => {
  const data = [
    {
      violcode: '030',
      count: 2
    }
  ];
  t.deepEqual(
    generateViolationSummaries(data),
    [
      `${data[0].count} ${VIOLATION[data[0].violcode]}`
    ]
  );
});

test('generateViolationSummaries should correctly parse more than one violation record', t => {
  const data = [
    {
      violcode: '030',
      count: 2
    },
    {
      violcode: '032',
      count: 3
    }
  ];
  t.deepEqual(
    generateViolationSummaries(data),
    [
      `${data[0].count} ${VIOLATION[data[0].violcode]}`,
      `${data[1].count} ${VIOLATION[data[1].violcode]}`
    ]
  );
});

test('generateViolationTweets should properly generate a single tweet', t => {
  const violations = [
    '2 Red light',
    '3 Fixed speed camera'
  ];
  t.deepEqual(
    generateViolationTweets('MD', 'ATRAIN', violations),
    [ `#MD_ATRAIN Violations:\n\n${violations[0]}\n${violations[1]}` ]
  );
});

test('generateViolationTweets should properly generate multiple tweets when there are many violations', t => {
  const violations = [
    '2 Red light',
    '3 Fixed speed camera',
    '1 Commercial vehicle/residence under 20,000 lbs.',
    '3 No stopping/parking stadium event Camden Yards',
    '1 No stopping/parking handicapped zone',
    '3 Impeding movement of pedestrians',
    '1 Blocking garage or driveway',
    '2 No stopping/parking stadium event on 33rd St.'
  ];
  t.deepEqual(
    generateViolationTweets('MD', 'ATRAIN', violations),
    [
      '#MD_ATRAIN Violations:\n\n2 Red light\n3 Fixed speed camera\n1 Commercial vehicle/residence under 20,000 lbs.\n3 No stopping/parking stadium event Camden Yards\n1 No stopping/parking handicapped zone\n3 Impeding movement of pedestrians\n1 Blocking garage or driveway',
      '#MD_ATRAIN Violations Cont\'d:\n\n2 No stopping/parking stadium event on 33rd St.'
    ]
  );
});

test('generateAnnualSummaryTweets should properly generate a table in a single tweet', t => {
  const data =  [
    { year: '2017', count: '2', annualFines: '80' },
    { year: '2018', count: '2', annualFines: '115' },
    { year: '2019', count: '4', annualFines: '195' }
  ];
  t.deepEqual(
    generateAnnualSummaryTweets('MD', 'ATRAIN', data),
    [
      `#MD_ATRAIN Fines by Year:

𝚈𝚎𝚊𝚛 𝚅𝚒𝚘𝚕𝚊𝚝𝚒𝚘𝚗𝚜 𝙵𝚒𝚗𝚎𝚜
𝟸𝟶𝟷𝟽           𝟸     𝟾𝟶
𝟸𝟶𝟷𝟾           𝟸    𝟷𝟷𝟻
𝟸𝟶𝟷𝟿           𝟺    𝟷𝟿𝟻
     ═══════════════════
               𝟾 $  𝟹𝟿𝟶`
    ]
  );
});

test('generateAnnualSummaryTweets should properly break the number of years is more than 280 characters', t=> {
  const data =  [
    { year: '2006', count: '2', annualFines: '80' },
    { year: '2007', count: '2', annualFines: '80' },
    { year: '2008', count: '1', annualFines: '40' },
    { year: '2009', count: '1', annualFines: '25' },
    { year: '2010', count: '3', annualFines: '150' },
    { year: '2011', count: '1', annualFines: '40' },
    { year: '2012', count: '1', annualFines: '25' },
    { year: '2013', count: '3', annualFines: '150' },
    { year: '2014', count: '1', annualFines: '40' },
    { year: '2015', count: '1', annualFines: '25' },
    { year: '2016', count: '3', annualFines: '150' },
    { year: '2017', count: '2', annualFines: '80' },
    { year: '2018', count: '2', annualFines: '115' },
    { year: '2019', count: '4', annualFines: '195' }
  ];
  t.deepEqual(
    generateAnnualSummaryTweets('MD', 'ATRAIN', data),
    [
      `#MD_ATRAIN Fines by Year:

𝚈𝚎𝚊𝚛 𝚅𝚒𝚘𝚕𝚊𝚝𝚒𝚘𝚗𝚜 𝙵𝚒𝚗𝚎𝚜
𝟸𝟶𝟶𝟼           𝟸     𝟾𝟶
𝟸𝟶𝟶𝟽           𝟸     𝟾𝟶
𝟸𝟶𝟶𝟾           𝟷     𝟺𝟶
𝟸𝟶𝟶𝟿           𝟷     𝟸𝟻
𝟸𝟶𝟷𝟶           𝟹    𝟷𝟻𝟶
𝟸𝟶𝟷𝟷           𝟷     𝟺𝟶`,
      `#MD_ATRAIN Fines by Year Cont'd:

𝚈𝚎𝚊𝚛 𝚅𝚒𝚘𝚕𝚊𝚝𝚒𝚘𝚗𝚜 𝙵𝚒𝚗𝚎𝚜
𝟸𝟶𝟷𝟸           𝟷     𝟸𝟻
𝟸𝟶𝟷𝟹           𝟹    𝟷𝟻𝟶
𝟸𝟶𝟷𝟺           𝟷     𝟺𝟶
𝟸𝟶𝟷𝟻           𝟷     𝟸𝟻
𝟸𝟶𝟷𝟼           𝟹    𝟷𝟻𝟶
𝟸𝟶𝟷𝟽           𝟸     𝟾𝟶`,
      `#MD_ATRAIN Fines by Year Cont'd:

𝚈𝚎𝚊𝚛 𝚅𝚒𝚘𝚕𝚊𝚝𝚒𝚘𝚗𝚜 𝙵𝚒𝚗𝚎𝚜
𝟸𝟶𝟷𝟾           𝟸    𝟷𝟷𝟻
𝟸𝟶𝟷𝟿           𝟺    𝟷𝟿𝟻
     ═══════════════════
              𝟸𝟽 $ 𝟷𝟷𝟿𝟻`
    ]
  );
});

test('generateAnnualSummaryTweets should properly break if the total lines goes over 280 characters', t=> {
  const data =  [
    { year: '2008', count: '1', annualFines: '40' },
    { year: '2009', count: '1', annualFines: '25' },
    { year: '2010', count: '3', annualFines: '150' },
    { year: '2011', count: '1', annualFines: '40' },
    { year: '2012', count: '1', annualFines: '25' },
    { year: '2013', count: '3', annualFines: '150' },
    { year: '2014', count: '1', annualFines: '40' },
    { year: '2015', count: '1', annualFines: '25' },
    { year: '2016', count: '3', annualFines: '150' },
    { year: '2017', count: '2', annualFines: '80' },
    { year: '2018', count: '2', annualFines: '115' },
    { year: '2019', count: '4', annualFines: '195' }
  ];
  t.deepEqual(
    generateAnnualSummaryTweets('MD', 'ATRAIN', data),
    [
      `#MD_ATRAIN Fines by Year:

𝚈𝚎𝚊𝚛 𝚅𝚒𝚘𝚕𝚊𝚝𝚒𝚘𝚗𝚜 𝙵𝚒𝚗𝚎𝚜
𝟸𝟶𝟶𝟾           𝟷     𝟺𝟶
𝟸𝟶𝟶𝟿           𝟷     𝟸𝟻
𝟸𝟶𝟷𝟶           𝟹    𝟷𝟻𝟶
𝟸𝟶𝟷𝟷           𝟷     𝟺𝟶
𝟸𝟶𝟷𝟸           𝟷     𝟸𝟻
𝟸𝟶𝟷𝟹           𝟹    𝟷𝟻𝟶`,
      `#MD_ATRAIN Fines by Year Cont'd:

𝚈𝚎𝚊𝚛 𝚅𝚒𝚘𝚕𝚊𝚝𝚒𝚘𝚗𝚜 𝙵𝚒𝚗𝚎𝚜
𝟸𝟶𝟷𝟺           𝟷     𝟺𝟶
𝟸𝟶𝟷𝟻           𝟷     𝟸𝟻
𝟸𝟶𝟷𝟼           𝟹    𝟷𝟻𝟶
𝟸𝟶𝟷𝟽           𝟸     𝟾𝟶
𝟸𝟶𝟷𝟾           𝟸    𝟷𝟷𝟻
𝟸𝟶𝟷𝟿           𝟺    𝟷𝟿𝟻`,
      `#MD_ATRAIN Fines by Year Cont'd:

     ═══════════════════
              𝟸𝟹 $ 𝟷𝟶𝟹𝟻`
    ]
  );
});

test('generateNoViolationsTweet generates an array with a single no violations tweet', t => {
  t.deepEqual(
    generateNoViolationsTweet('MD', 'ATRAIN'),
    [ '#MD_ATRAIN has no known violations in Baltimore 👍' ]
  );
});

test('convertToMonospace handles space character', t => {
  t.is(convertToMonospace(' '), ' ');
});

test('convertToMonospace handles all capital letters', t => {
  t.is(convertToMonospace('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉');
});

test('convertToMonospace handles all lowercase letters', t => {
  t.is(convertToMonospace('abcdefghijklmnopqrstuvwxyz'), '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣');
});

test('convertToMonospace handles all numbers', t => {
  t.is(convertToMonospace('0123456789'), '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿');
});