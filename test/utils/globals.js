
window.util   = require('util');
window.async  = require('async');
window._      = require('lodash');

window.seneca = {
  ng: {
    web: function() {
      return function() {};
    }
  }
};

window.initBackend = function($httpBackend, target){
  if (!target) {
    console.log('WARNING unresolved target for initBackend')
    return
  }
  
  var targets = [];
  if (typeof target === 'string') targets.push(target);
  else targets = target;

  _.each(targets, function(target){
    $httpBackend.when('GET', target).respond({});
    $httpBackend.expectGET(target);
  })
}

window.logf_path;
window.logf= function(msg){
  return (logf_path + ': @' + msg);
}

// for each service, find all functions and stub them
window.stubAll = function(args){
  var map      = args.map,
      sandbox  = args.sandbox,
      no_yield = args.no_yield;
  if (!no_yield) no_yield = [];

  var services = {},
      stubs    = {};

  _.each(Object.keys(map), function(service_name){

    var _ref_ = map[service_name];
    services[service_name] = _ref_; // same as e.g. services.auth = _auth_
    // console.log('service_name: ' + service_name);

    _.each(Object.keys(_ref_), function(func_name){

      // console.log('\t\tfunc: ' + func_name);
      var field = _ref_[func_name];
      if (typeof field == "function") {

        if (!stubs[service_name]) stubs[service_name] = {};
        if (!stubs[service_name][func_name]) stubs[service_name][func_name] = {};

        stubs[service_name][func_name] = sandbox.stub(services[service_name], func_name);
        if (no_yield.indexOf(func_name) === -1) stubs[service_name][func_name].yields({});
        // else console.log('omitting ' + func_name)
      }
    });
  });

  return {services: services, stubs: stubs}
}