const test = require('ava');
const { VIOLATION } = require('./constants');
const { 
    generateViolationSummaries,
    generateViolationTweets,
    matchLicensePlates,
    generateAnnualSummaryTweets
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
            violcode: "030",
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
            violcode: "030",
            count: 2
        },
        {
            violcode: "032",
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
            `#MD_ATRAIN Violations:\n\n2 Red light\n3 Fixed speed camera\n1 Commercial vehicle/residence under 20,000 lbs.\n3 No stopping/parking stadium event Camden Yards\n1 No stopping/parking handicapped zone\n3 Impeding movement of pedestrians\n1 Blocking garage or driveway`,
            `#MD_ATRAIN Violations Cont'd:\n\n2 No stopping/parking stadium event on 33rd St.`
        ]
    )
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
            '#MD_ATRAIN Fines by Year:\n\nYear #Viol Fines\n2017     2    80\n2018     2   115\n2019     4   195\n     ===========\n         8   390'
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

Year #Viol Fines
2006     2    80
2007     2    80
2008     1    40
2009     1    25
2010     3   150
2011     1    40
2012     1    25
2013     3   150
2014     1    40
2015     1    25
2016     3   150
2017     2    80
2018     2   115`,
`#MD_ATRAIN Fines by Year Cont'd:

Year #Viol Fines
2019     4   195
     ===========
        27  1195`
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

Year #Viol Fines
2008     1    40
2009     1    25
2010     3   150
2011     1    40
2012     1    25
2013     3   150
2014     1    40
2015     1    25
2016     3   150
2017     2    80
2018     2   115
2019     4   195`,
`#MD_ATRAIN Fines by Year Cont'd:

     ===========
        23  1035`
        ]
    );
});