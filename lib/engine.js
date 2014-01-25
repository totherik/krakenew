'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    provider = require('./provider'),
    dust = require('dustjs-linkedin'),
    contextify = require('dustjs-onload-context');


contextify({ cache: false });


var engine = module.exports = {
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


dust.onLoad = function (name, context, cb) {
    var viewdir, ext, view, data;

    viewdir = context.get('settings').views;
    ext = context.get('settings').ext;
    view = engine.viewProvider.get(name);
    data = engine.dataProvider.get(name);

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

        data(name, context, function (err, data) {
            if (err) {
                cb(err);
                return;
            }

            if (data) {
                context = context.push(data);
            }

            readFiles(files, function (err, data) {
                if (err) {
                    cb(err);
                    return;
                }

                try {

                    dust.loadSource(dust.compile(data, name));

                } catch (error) {
                    cb(error);
                    return;
                }

                dust.render(name, context, function (err, data) {
                    // Replace the named template in context with an
                    // already rendered version.
                    dust.loadSource(dust.compile(data, name));
                    cb(err);
                });
            });

        });
    });
};