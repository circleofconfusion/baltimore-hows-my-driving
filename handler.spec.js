const test = require('ava');
const handler = require('./handler');

test('handler endpoints exist', t => {
    console.log(handler);
    t.true(handler.twitterWebhook != undefined);
    t.true(handler.crcResponse != undefined);
});