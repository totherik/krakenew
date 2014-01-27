'use strict';

var fs = require('fs'),
    path = require('path'),
    River = require('./river'),
    dust = require('dustjs-linkedin');

// is this for reals?
dust.silenceErrors = true;


function loadSourcePreprocessor(data, name) {
    dust.loadSource(data);
}


function compileAndLoadPreprocessor(data, name) {
    loadSourcePreprocessor(dust.compile(data, name));
}


function renderHandler(name, options, fn) {
    dust.render(name, options, fn);
}


function streamHandler(name, options, fn) {
    fn(null, new River(dust.stream(name, options)));
}


function buildRenderer(preprocessor, handler) {
    return function render(file, options, fn) {
        var ext, name;

        ext = options.settings.ext = path.extname(file);
        name = path.relative(options.settings.views, file);
        name = name.replace(ext, '');

        dust.onLoad = dust.onLoad || function onLoad(name, fn) {
            fs.readFile(file, 'utf8', function (err, data) {
                try {

                    !err && preprocessor(data, name);

                } catch (error) {
                    err = error;
                } finally {
                    fn(err);
                }
            });
        };

        handler(name, options, fn);
    };
}


exports.dust = buildRenderer(loadSourcePreprocessor, renderHandler);


exports.compiledDust = buildRenderer(compileAndLoadPreprocessor, renderHandler);


exports.streamedDust = buildRenderer(loadSourcePreprocessor, streamHandler);


exports.streamedCompiledDust = buildRenderer(compileAndLoadPreprocessor, streamHandler);
