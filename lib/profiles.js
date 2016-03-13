'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');
var fs = require('fs');
var defaultImage = new Buffer(fs.readFileSync(__dirname + '/../web/public/img/avatar.png', 'base64'), 'base64');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-profiles');

  server.route([{
    method: 'POST',
    path: options.basePath + '/profiles/user-profile-data',
    handler: handlers.actHandlerNeedsUser('user_profile_data','id',{isOwn: true})
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/{id}/avatar',
    handler: handlers.actHandler('get_avatar', 'id')
  }, {
    method: 'GET',
    /* Note: some older profiles in nodebb still using the 1.0 route*/
    path: '/api/1.0/profiles/{id}/avatar_img',
    handler: handleAvatarImage
  }]);

  function handleAvatarImage (request, reply) {
    var zenHostname = request.headers.host || '127.0.0.1:8000';
    var user = request.user ? request.user.user : null;
    var msg = _.extend({user: user, zenHostname: zenHostname, role: 'cd-profiles', cmd: 'get_avatar', id: request.params.id}, request.payload);
    request.seneca.act(msg, function (err, res) {
      if (err || !res) {
        // send default profile pic
        return reply(defaultImage).header('Content-Type', 'image/png').header('Content-Length', defaultImage.length);
      }

      var buf = new Buffer(res.imageData, 'base64');
      return reply(buf).header('Content-Type', 'image/png').header('Content-Length', buf.length);
    });
  }

  next();
};

exports.register.attributes = {
  name: 'api-profiles'
};
