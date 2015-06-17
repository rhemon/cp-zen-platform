'use strict';

describe('dojo-detail-controller', function() {

  var scope,
      ctrl,
      sandbox,
      $httpBackend,
      services,
      stubs;

  var sample_dojo;

  beforeEach(function() {
    window.logf_path = __filename;
    sandbox = sinon.sandbox.create();
    google = new Google(sandbox);

    fixture.setBase('test/fixtures')
    sample_dojo = fixture.load('dojo.json');

    angular.mock.module('cpZenPlatform');
  })

  beforeEach(inject(function(
    $rootScope,
    $controller,
    _$location_,
    _$window_,
    _$browser_,
    _$httpBackend_,
    _cdDojoService_,
    _alertService_,
    _GoogleMapsInitializer_
  ) {
    $httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    };

    scope = $rootScope.$new();

    // for each service, find all functions and stub them
    var map = {
      cdDojo: _cdDojoService_,
      alert: _alertService_,
      gmap: _GoogleMapsInitializer_
    };
    var res = stubAll({map: map, sandbox: sandbox, no_yield:['showAlert']});
    services = res.services;
    stubs = res.stubs;
    // specific:
    stubs.google = google;

    ctrl = $controller('dojo-detail-controller', {
      $scope: scope,
      $stateParams: {
          id: 0
      },
      $location: _$location_,
      $window: _$window_,
      cdDojoService: services.cdDojo,
      alertService: services.alert,
      dojo: sample_dojo,
      gmap: services.gmap
    });

    initBackend($httpBackend, ['/locale/data?format=mf&lang=en_US', '/locale/data?format=mf&lang=en_IE', '/auth/instance']);
    scope.$apply();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('load dojo map', function() {
    var mapstub = stubs.google.maps;

    // verify calls
    expect(mapstub.LatLng.callCount).to.equal(1, logf('mapstub.LatLng.callCount'));
    scope.model.map = 'map_data';
    scope.$apply(); // trigger variable watcher
    expect(mapstub.Marker.callCount).to.equal(1, logf('mapstub.Marker.callCount'));
    expect(mapstub.LatLng.callCount).to.equal(2, logf('mapstub.LatLng.callCount'));
    expect(mapstub.LatLng.lastCall.args).to.include.members([sample_dojo.geoPoint.lat, sample_dojo.geoPoint.lon],
                                                 logf('mapstub.LatLng.lastCall.args'));
    expect(mapstub.Marker.lastCall.args[0].map).to.equal(scope.model.map,
                                                 logf('mapstub.Marker.lastCall.args[0].map'));
    // currently controller calls new on stub object and uses that as a field. It's difficult to change what new stub_instance() will return.
    // redefining these objects could result in losing utility functions (e.g. lastCall, callCount)
    expect(mapstub.Marker.lastCall.args[0].position).to.deep.equal({},
                                                 logf('mapstub.Marker.lastCall.args[0].position'));

    // verify scope changes
    expect(scope.mapLoaded).to.equal(true,                 logf('scope.mapLoaded'));
    expect(scope.mapOptions.center).to.deep.equal({},      logf('scope.mapOptions.center'));
    expect(scope.mapOptions.zoom).to.equal(15,             logf('scope.mapOptions.zoom'));
    expect(scope.mapOptions.mapTypeId).to.equal('roadmap', logf('scope.mapOptions.mapTypeId'));
    expect(scope.markers.length).to.equal(1,               logf('scope.markers.length'));
  });
});
