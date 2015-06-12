'use strict';

describe('stats-controller', function() {

  var scope,
      ctrl,
      sandbox,
      $httpBackend,
      services, // contains refs to implementations
      stubs, // contains stubs of these
      expected;

  beforeEach(function() {
    window.logf_path = __filename;
    sandbox = sinon.sandbox.create();
    angular.mock.module('cpZenPlatform')

    fixture.setBase('test/fixtures')
    expected = fixture.load('countries.json');
  })

  beforeEach(inject(function(
    $rootScope,
    $controller,
    _$browser_,
    _$httpBackend_,
    _alertService_,
    _auth_,
    _cdAgreementsService_,
    _cdDojoService_,
    _cdCountriesService_
  ) {
    $httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    };

    scope = $rootScope.$new();

    // for each service, find all functions and stub them
    var map = {
      alert: _alertService_,
      auth : _auth_,
      cdAgreements: _cdAgreementsService_,
      cdDojo: _cdDojoService_,
      cdCountries: _cdCountriesService_
    };
    var res = stubAll({map: map, sandbox: sandbox}); // stubAll() defined in util/globals.js
    services = res.services;
    stubs = res.stubs;
    // specific:
    stubs.cdAgreements.count.yields(7);
    stubs.cdDojo.getStats.yields(expected.stats);
    stubs.cdCountries.getContinentCodes.yields(expected.continent_codes);

    ctrl = $controller('stats-controller', {
      $scope: scope,
      alertService: services.alert,
      auth: services.auth,
      cdAgreementsService: services.cdAgreements,
      cdDojoService: services.cdDojo,
      cdCountriesService: services.cdCountries
    });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('get stats', function() {
    initBackend($httpBackend, ['/locale/data?format=mf&lang=en_US',
                 '/locale/data?format=mf&lang=en_IE']);
    initBackend($httpBackend, '/auth/instance');
    scope.$apply();

    // verify calls
    expect(stubs.alert.showError.callCount).to.equal(0,               logf('alert.showError.callCount'));
    expect(stubs.auth.get_loggedin_user.callCount).to.equal(1,        logf('auth.get_loggedin_user.callCount'));
    expect(stubs.cdAgreements.count.callCount).to.equal(1,            logf('cdAgreements.count.callCount'));
    expect(stubs.cdDojo.getStats.callCount).to.equal(1,               logf('cdDojo.getStats.callCount'));
    expect(stubs.cdCountries.getContinentCodes.callCount).to.equal(1, logf('cdCountries.getContinentCodes.callCount'));

    // verify scope changes
    expect(scope.count).to.be.equal(7,                                           logf('scope.count'));
    expect(scope.dojos).to.deep.equal(expected.stats,                            logf('scope.dojos'));
    expect(scope.totals).to.deep.equal(expected.totals,                          logf('scope.totals'));
    expect(scope.continentMap).to.deep.equal(_.invert(expected.continent_codes), logf('scope.continentMap'));
  });
});
