'use strict';

var test = require('tape'),
    path = require('path'),
    engine = require('../lib/engine'),
    dust = require('dustjs-linkedin');


test('engine', function (t) {

    function run(iterations, fn, complete) {
        var awaiting = 0;

        (function go() {

            awaiting += 1;
            fn(function () {
                awaiting -= 1;
                if (!iterations && !awaiting) {
                    complete();
                }
            });

            if (iterations) {
                setImmediate(go);
                iterations -= 1;
            }

        }());
    }

    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function views(name, context, cb) {
        var resolved = context.get('alt');
        if (resolved) {
            name = name + '_' + resolved;
        }

        cb(null, name);
    }

    t.test('race conditions', function (t) {
        var view, data, a, b;

        view = engine.viewProvider;
        view.set('index', views);
        view.set('partial', views);

        data = engine.dataProvider;
        data.set('index', function (name, context, cb) {
            cb = cb.bind(null, null, { name: 'Fred' });
            setTimeout(cb, getRandomInt(0, 500));
        });
        data.set('partial', function (name, context, cb) {
            cb = cb.bind(null, null, { name: 'Dave' });
            setTimeout(cb, getRandomInt(0, 500));
        });

        a = 'Hello, Fred, how\'s Dave?';
        b = 'I\'m sorry, <em>Dave</em>, I\'m afraid I can\'t do that. Ask Fred.';

        function exec(cb) {
            var options, expected, flag;

            options = {
                name: 'world',
                settings: {
                    views: path.resolve(__dirname, '../views'),
                    ext: '.dust'
                }
            };

            expected = a;
            flag = getRandomInt(0, 100) % 2 === 0;
            if (flag) {
                expected = b;
                options.alt = 'cell1';
            }

            dust.render('index', dust.makeBase(options), function (err, data) {
                t.error(err);
                t.equal(data, expected);
                setTimeout(cb, getRandomInt(0, 500));
            });
        }

        function complete() {
            console.log('done');
            t.end();
        }

        run(10000, exec, complete);
    });

});
