'use strict';

describe('dojo-detail-controller', function() {
  logf_path = __filename;

  // no need to use var when defining variables because of window abstraction
  user_types = ['attendee-o13', 'parent-guardian' , 'mentor', 'champion']

  beforeEach(function() {
    window.sandbox = sinon.sandbox.create();
    window.google = new Google(sandbox);

    fixture.setBase('test/fixtures')
    window.sample_dojo = fixture.load('dojo.json');
    window.auth_instance = fixture.load('auth.instance.json');

    angular.mock.module('cpZenPlatform');
  })

  beforeEach(inject(function(
    $rootScope,
    $controller,
    _$location_,
    _$window_,
    _$translate_,
    _$browser_,
    _$httpBackend_,
    _cdDojoService_,
    _alertService_,
    _auth_,
    _usSpinnerService_,
    _GoogleMapsInitializer_
  ) {
    window.$httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    };

    window.scope = $rootScope.$new();

    // for each service, find all functions and stub them
    var map = {
      translate: _$translate_,
      cdDojo: _cdDojoService_,
      auth: _auth_,
      alert: _alertService_,
      usSpinner: _usSpinnerService_,
      gmap: _GoogleMapsInitializer_
    };
    var res = stubAll({map: map, sandbox: sandbox, no_yield:['showAlert'], no_stub: ['instant']});
    window.services = res.services;
    window.stubs = res.stubs;
    // specific:
    services.google = google;
    stubs.google = google;
    stubs.auth.get_loggedin_user.yields(auth_instance.user);
    stubs.cdDojo.getUsersDojos.yields(sample_dojo);
    stubs.cdDojo.getUserTypes.yields(user_types);
    sandbox.stub(services.translate, 'instant', function(args) { return args });

    window.ctrl = $controller('dojo-detail-controller', {
      $scope: scope,
      $state: {
        params: {
          id: 0
        }
      },
      $stateParams: {
          id: 0
      },
      $location: _$location_,
      $translate: services.translate,
      $window: _$window_,
      cdDojoService: services.cdDojo,
      alertService: services.alert,
      auth: services.auth,
      dojo: sample_dojo,
      gmap: services.gmap
    });

    initBackend($httpBackend, ['/locale/data?format=mf&lang=en_US', '/locale/data?format=mf&lang=en_IE', '/auth/instance']);
    scope.$apply();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('init', function() {
    mapstub = stubs.google.maps;

    // verify calls
    expect(that('mapstub.LatLng.callCount')).to.equal(1, elog);
    scope.model.map = 'map_data';
    scope.$apply(); // trigger variable watcher
    expect(that('stubs.auth.get_loggedin_user.callCount')).to.equal(1, elog);
    expect(that('stubs.cdDojo.getUsersDojos.callCount')).to.equal(1, elog);
    expect(that('stubs.cdDojo.getUsersDojos.lastCall.args')[0]).to.deep.equal({dojoId:sample_dojo.id, userId:auth_instance.user.id}, elog);
    expect(that('mapstub.Marker.callCount')).to.equal(1, elog);
    expect(that('mapstub.LatLng.callCount')).to.equal(2, elog);
    expect(that('mapstub.LatLng.lastCall.args')).to.include.members([sample_dojo.geoPoint.lat, sample_dojo.geoPoint.lon], elog);
    expect(that('mapstub.Marker.lastCall.args')[0].map).to.equal(scope.model.map, elog);
    // currently controller calls new on stub object and uses that as a field. It's difficult to change what new stub_instance() will return.
    // redefining these objects could result in losing utility functions (e.g. lastCall, callCount). Currently returns {}.
    expect(that('mapstub.Marker.lastCall.args')[0].position).to.deep.equal({}, elog);

    // verify scope changes
    expect(that('scope.dojoMember')).to.equal(true, elog);
    expect(that('scope.userMemberCheckComplete')).to.equal(true, elog);
    expect(that('scope.userTypes')).to.equal(user_types, elog);
    expect(that('scope.mapLoaded')).to.equal(true, elog);
    expect(that('scope.mapOptions.center')).to.deep.equal({}, elog);
    expect(that('scope.mapOptions.zoom')).to.equal(15, elog);
    expect(that('scope.mapOptions.mapTypeId')).to.equal('roadmap', elog);
    expect(that('scope.markers.length')).to.equal(1, elog);
  });
});
