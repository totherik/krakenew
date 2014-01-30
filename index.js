'use strict';

var i18n = require('makara'),
    express = require('express'),
    kraken = require('kraken.next');


var app = express();

app.on('start', function () {
    i18n.create(app, app.kraken.get('i18n'))
});

app.on('error', function (err) {
    console.error(err.stack);
});

app.use(kraken());
app.listen(8000);

