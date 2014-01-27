'use strict';

var fs = require('graceful-fs'),
    path = require('path'),
    async = require('async'),
    provider = require('./provider'),
    dust = require('dustjs-linkedin'),
    contextify = require('dustjs-onload-context');


contextify({ cache: false });

var counters, engine;
counters = {};
engine = module.exports = {
    viewProvider: provider.create(),
    dataProvider: provider.create()
};


function readFiles(files, cb) {
    var idx, found, file;

    found = false;
    idx = 0;

    function inc() {
        return found || idx === files.length;
    }

    function exists(cb) {
        file = files[idx];
        idx += 1;
        fs.exists(file, function (bool) {
            found = bool;
            cb();
        });
    }

    function complete(err) {
        if (err) {
            cb(err);
            return;
        }

        if (!found) {
            cb(new Error('template not found'));
            return;
        }

        fs.readFile(file, 'utf8', cb);
    }

    async.until(inc, exists, complete);
}


function init(impl) {
    return function (name, context, cb) {
        var viewdir, ext, view, data, idx;

        viewdir = context.get('settings').views;
        ext = context.get('settings').ext;
        view = engine.viewProvider.get(name);
        data = engine.dataProvider.get(name);

        // Since we're doing template inception, create a somewhat UID
        // to manage composite templates.
        idx = counters[name] || 0;
        idx = counters[name] = (idx === Number.MAX_VALUE) ? Number.MIN_VALUE : idx + 1;

        view(name, context, function (err, alt) {
            var files;

            if (err) {
                cb(err);
                return;
            }

            files = [
                path.join(viewdir, alt || name) + ext,
                path.join(viewdir, name) + ext
            ];

            data(alt || name, context, function (err, data) {
                if (err) {
                    cb(err);
                    return;
                }

                readFiles(files, function (err, str) {
                    if (err) {
                        cb(err);
                        return;
                    }

                    if (data) {
                        context = context.push(data);
                        name = name + idx;
                    }

                    try {

                        impl(str, name);

                    } catch (error) {
                        cb(error);
                        return;
                    }

                    if (data) {
                        // Render what we need to fulfill this partial
                        dust.render(name, context, cb);
                        return;
                    }

                    cb();
                });

            });
        });
    };
}


function loadSource(data, name) {
    dust.loadSource(data);
}


function compileAndLoad(data, name) {
    loadSource(dust.compile(data, name));
}


dust.onLoad = init(compileAndLoad);
