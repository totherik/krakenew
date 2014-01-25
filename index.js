'use strict';

var express = require('express'),
    kraken = require('kraken.next'),
    engine = require('./lib/engine');


function views(name, context, cb) {
    var resolved = context.get('alt');
    if (resolved) {
        name = name + '_' + resolved;
    }

    cb(null, name);
}


engine.viewProvider.set('index', views);
engine.viewProvider.set('partial', views);


engine.dataProvider.set('index', function (name, context, cb) {
    setImmediate(cb.bind(null, null, { name: 'Fred' }));
});

engine.dataProvider.set('partial', function (name, context, cb) {
    setImmediate(cb.bind(null, null, { name: 'Dave' }));
});



var app = express();
app.on('error', console.error.bind(console));
app.use(kraken());
app.listen(8000);

