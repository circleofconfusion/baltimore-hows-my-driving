const test = require('ava');
const { VIOLATION } = require('./constants');
const { generateViolationSummaries, generateViolationTweets, matchLicensePlates } = require('./text-parsing');

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