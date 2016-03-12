'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');
var Joi = require('joi');

var joiValidator = {
  latitude: function() {
    return Joi.number().min(-90).max(90);
  },
  longitude: function() {
    return Joi.number().min(-180).max(180);
  },
  mail: function() {
    return Joi.string().email();
  },
  alpha2: function() {
    return Joi.string().length(2).regex(/[A-Z]{2}/);
  },
  alpha3: function() {
    return Joi.string().length(3).regex(/[A-Z]{3}/);
  },
  continent: function() {
    return Joi.string().length(2).regex(/[A-Z]{2}/);
  },
  twitter: function() {
    return Joi.string();
  },
  uri: function() {
    return Joi.alternatives().try(Joi.string().uri(), Joi.string());
  },
  country: function() {
    return Joi.object().keys({
      countryName: Joi.string().required(),
      countryNumber: Joi.number().integer(),
      continent: joiValidator.continent(),
      alpha2: joiValidator.alpha2(),
      alpha3: joiValidator.alpha3(),
      $$hashKey: Joi.optional()
    });
  },
  phone: function() {
    return Joi.string();
  },
  place: function() {
    return Joi.object().keys({
      nameWithHierarchy: Joi.string(),
      toponymName: Joi.string(),
      $$hashKey: Joi.optional()
    });
  },
  championDetails: function() {
    return Joi.object().keys({
      email: joiValidator.mail().required(),
      name: Joi.string().required(),
      dateOfBirth: Joi.date(),
      phone: joiValidator.phone(),
      country: joiValidator.country(),
      placeName: Joi.string(),
      county: Joi.object().allow(null),
      state: Joi.object().allow(null),
      city: Joi.object().allow(null),
      place: joiValidator.place(),
      countryName: Joi.string().required(),
      countryNumber: Joi.number().integer(),
      continent: joiValidator.continent(),
      alpha2: joiValidator.alpha2().required(),
      alpha3: joiValidator.alpha3(),
      address1: Joi.string().required(),
      coordinates: Joi.string(),
      projects: Joi.string().allow(""),
      youthExperience: Joi.string().allow(""),
      twitter: joiValidator.twitter().allow(""),
      linkedIn: joiValidator.uri().allow(""),
      notes: Joi.string().allow(""),
      coderDojoReference: Joi.string(),
      coderDojoReferenceOther: Joi.string()
    });
  },
  setupYourDojo: function() {
    return Joi.object().keys({
      findTechnicalMentors: Joi.boolean(),
      findTechnicalMentorsText: Joi.string(),
      findNonTechnicalMentors: Joi.boolean(),
      findNonTechnicalMentorsText: Joi.string().allow("").allow(null),
      locateVenue: Joi.boolean(),
      locateVenueText: Joi.string(),
      setDojoDateAndTime: Joi.boolean(),
      setDojoDateAndTimeText: Joi.string(),
      setDojoEmailAddress: Joi.boolean(),
      setupSocialMedia: Joi.boolean(),
      embodyCoderDojoTao: Joi.boolean(),
      backgroundCheck: Joi.boolean(),
      backgroundCheckText: Joi.string().allow("").allow(null),
      ensureHealthAndSafety: Joi.boolean(),
      ensureHealthAndSafetyText: Joi.string().allow("").allow(null),
      ensureInsuranceCover: Joi.boolean(),
      ensureInsuranceCoverText: Joi.string().allow("").allow(null),
      planContent: Joi.boolean(),
      setupTicketingAndRegistration: Joi.boolean(),
      connectOtherDojos: Joi.boolean(),
      onlineSafetyBestPractice: Joi.boolean(),
      onlineSafetyBestPracticeText: Joi.string().allow("").allow(null),
      dataProtectionRegulated: Joi.boolean(),
      dataProtectionRegulatedText: Joi.string().allow("").allow(null),
      diversityRespected: Joi.boolean(),
      diversityRespectedText: Joi.string().allow("").allow(null),
      engageCoderDojoMovement: Joi.boolean(),
      engageCoderDojoMovementText: Joi.string().allow("").allow(null)
    });
  },
  application: function() {
    return Joi.object().keys({
      championDetails: joiValidator.championDetails(),
      setupYourDojo: joiValidator.setupYourDojo(),
      dojoListing: Joi.object()
    });
  },
  user: function() {
    return Joi.object().keys({
      id: joiValidator.guid().required(),
      nick: Joi.string(),
      email: joiValidator.mail().required(),
      name: Joi.string().required(),
      username: Joi.any(),
      activated: Joi.any(),
      level: Joi.any(),
      mysqlUserId: Joi.any(),
      firstName: Joi.any(),
      lastName: Joi.any(),
      roles: Joi.array().required(),
      phone: Joi.any(),
      mailingList: Joi.any(),
      termsConditionsAccepted: Joi.any(),
      when: Joi.date(),
      confirmed: Joi.any(),
      admin: Joi.any(),
      modified: Joi.any(),
      locale: Joi.any(),
      banned: Joi.any(),
      banReason: Joi.any(),
      initUserType: Joi.object().keys({
        name: Joi.string(),
        title: Joi.string()
      }),
      joinRequests: Joi.any(),
      lastLogin: Joi.date()
    });
  },
  guid: function() {
    return Joi.alternatives().try(Joi.string().guid(), Joi.string());
  }
}

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-dojos');

  server.route([{
    method: 'POST',
    path: options.basePath + '/dojos/search-bounding-box',
    handler: handlers.actHandler('search_bounding_box'),
    config: {
      description: 'Search dojos',
      notes: 'Search dojos located in a bounding box area',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required(),
          radius: Joi.number().min(0).required(),
          search: Joi.string()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/find',
    handler: handlers.actHandler('find'),
    config: {
      description: 'Find',
      notes: 'Find',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          dojoLeadId: joiValidator.guid(),
          urlSlug: Joi.string()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search',
    handler: handlers.actHandler('search'),
    config: {
      description: 'Search dojos',
      notes: 'Search dojos',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          name: Joi.string().optional(),
          verified: Joi.number().integer(),
          email: Joi.string().optional(),
          creatorEmail: Joi.string().optional(),
          stage: Joi.number().integer().optional(),
          alpha2: joiValidator.alpha2().optional().description('two capital letters representing the country'),
          limit$: Joi.number().integer().min(0).optional(),
          skip$: Joi.number().integer().min(0).optional(),
          sort$: Joi.object().keys({
            created: Joi.number().valid(-1).valid(1).optional()
          })
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/by-country',
    handler: handlers.actHandler('dojos_by_country'),
    config: {
      description: 'ByCountry',
      notes: 'ByCountry',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          verified: Joi.number().valid(0).valid(1),
          deleted: Joi.number().valid(0).valid(1)
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos',
    handler: handlers.actHandler('list'),
    config: {
      description: 'List',
      notes: 'List',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.alternatives().try(Joi.any(), Joi.object({ query: {
          name: Joi.string(),
          verified: Joi.number().valid(0).valid(1),
          stage: Joi.number().integer(),
          deleted: Joi.number().valid(0).valid(1),
          alpha2:joiValidator.alpha2(),
          fields$: Joi.array()
        }}))
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/{id}',
    handler: handlers.actHandler('load', 'id'),
    config: {
      description: 'dojos',
      notes: 'dojos',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-nearest-dojos',
    handler: handlers.actHandler('search_nearest_dojos'),
    config: {
      description: 'search nearest dojo',
      notes: 'search nearest dojo',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries',
    handler: handlers.actHandler('list_countries'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'list countries',
      notes: 'list countries',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/countries/places',
    handler: handlers.actHandler('list_places'),
    config: {
      description: 'list places',
      notes: 'list places',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({ search: {
          countryCode: joiValidator.alpha2().required(),
          search: Joi.string().required()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents/lat-long',
    handler: handlers.actHandler('continents_lat_long'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'continents lat long',
      notes: 'continents lat long',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/lat-long',
    handler: handlers.actHandler('countries_lat_long'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'countries lat long',
      notes: 'countries lat long',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents/codes',
    handler: handlers.actHandler('continent_codes'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'continent codes',
      notes: 'continent codes',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents',
    handler: handlers.actHandler('countries_continents'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'countries continents',
      notes: 'countries continents',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-dojos'
};
