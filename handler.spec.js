const test = require('ava');
const handler = require('./handler');

test('handler endpoints exist', t => {
    t.true(handler.twitterWebhook != undefined);
    t.true(handler.crcResponse != undefined);
});