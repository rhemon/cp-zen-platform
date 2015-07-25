'use strict';

var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var r = require('request').defaults({ json: true });
var config = require('../../options.' + env  + '.js');

// TODO move to cp-zen-platform/lib/cd-countries.js ?
module.exports = [
  {
    method: 'GET',
    path: '/maps/places',
    handler: function (request, reply) {
      var options = {
        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        method: 'GET',
        headers: { Referer: request.headers.referer },
        qs: {
          key: config.maps.googleApiKey,
          types: '(cities)',
          components: 'country:' + request.query.country,
          input: request.query.q
        }
      };

      r(options, function (error, response, data) {
        if (error) { reply(error); }
        var places = _.chain(data.predictions)
          .map('description')
          .map(function (name) {
            var parts = name.split(',');
            if (parts.length === 1) { return name; }
            // Remove the country from the end of the string
            return parts.slice(0,-1).join(',');
          })
          .value();

        reply(places);
      });
    }
  }
];
