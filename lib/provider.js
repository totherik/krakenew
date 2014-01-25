'use strict';

function noop(name, context, cb) {
    setImmediate(cb.bind(null, null));
}

exports.create = function () {
    var resolvers = {};

    return {

        get: function (name) {
            return resolvers[name] || noop;
        },

        set: function (name, resolver) {
            resolvers[name] = resolver;
        }

    };
};