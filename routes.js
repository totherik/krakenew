'use strict';


module.exports = function (app) {

    app.get('/', function (req, res) {
        res.locals.context = res.locals.context || {};
        res.locals.context.locality = {
            country: 'US',
            language: 'en'
        };

        res.render('index', { name: 'world', alt: req.query.alt });
    });

};