'use strict';

var fs = require('fs'),
    path = require('path'),
    dust = require('dustjs-linkedin');

// is this for reals?
dust.silenceErrors = true;

exports.dust = function (file, options, fn) {
    var ext, name;

    ext = options.settings.ext = path.extname(file);
    name = path.relative(options.settings.views, file);
    name = name.replace(ext, '');

    dust.onLoad = dust.onLoad || function (name, fn) {
        fs.readFile(file, 'utf8', function (err, data) {
            try {

                !err && dust.loadSource(dust.compile(data, name));

            } catch (error) {
                err = error;
            } finally {
                fn(err);
            }
        });
    };

    dust.render(name, options, fn);
};


exports.compiledDust = function (file, options, fn) {
    var name;

    name = path.relative(options.settings.views, file);
    name = name.replace(path.extname(name), '');

    dust.onLoad = dust.onLoad || function (name, fn) {
        fs.readFile(file, 'utf8', function (err, data) {
            try {

                !err && dust.loadSource(data);

            } catch (error) {
                err = error;
            } finally {
                fn(err);
            }
        });
    };

    dust.render(name, options, fn);
};