'use strict';

var express = require('express'),
    kraken = require('kraken.next'),
    stream = require('./lib/stream'),
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


//engine.dataProvider.set('index', function (name, context, cb) {
//    setImmediate(cb.bind(null, null, { name: 'Fred' }));
//});

engine.dataProvider.set('greeting', function (name, context, cb) {
    setTimeout(cb.bind(null, null, { name: 'Fred' }, 350));
});


engine.dataProvider.set('partial', function (name, context, cb) {
    setTimeout(cb.bind(null, null, { name: 'Dave' }), 500);
});



var app = express();
stream.apply(app);
app.on('error', console.error.bind(console));
app.use(kraken());
app.listen(8000);

