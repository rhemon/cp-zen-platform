'use strict';

describe('stats-controller', function() {
  logf_path = __filename;

  beforeEach(function() {
    window.sandbox = sinon.sandbox.create();
    angular.mock.module('cpZenPlatform')

    fixture.setBase('test/fixtures')
    window.expected = fixture.load('countries.json');
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
    window.$httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    };

    window.scope = $rootScope.$new();

    // for each service, find all functions and stub them
    var map = {
      alert: _alertService_,
      auth : _auth_,
      cdAgreements: _cdAgreementsService_,
      cdDojo: _cdDojoService_,
      cdCountries: _cdCountriesService_
    };
    var res = stubAll({map: map, sandbox: sandbox}); // stubAll() defined in util/globals.js
    window.services = res.services; // contains refs to implementations(stubs override these)
    window.stubs = res.stubs; // contains stubs of services
    // specific:
    stubs.cdAgreements.count.yields(7);
    stubs.cdDojo.getStats.yields(expected.stats);
    stubs.cdCountries.getContinentCodes.yields(expected.continent_codes);

    window.ctrl = $controller('stats-controller', {
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
    expect(that('stubs.alert.showError.callCount')).to.equal(0, elog);
    expect(that('stubs.auth.get_loggedin_user.callCount')).to.equal(1, elog);
    expect(that('stubs.cdAgreements.count.callCount')).to.equal(1, elog);
    expect(that('stubs.cdDojo.getStats.callCount')).to.equal(1, elog);
    expect(that('stubs.cdCountries.getContinentCodes.callCount')).to.equal(1, elog);

    // verify scope changes
    expect(that('scope.count')).to.be.equal(7, elog);
    expect(that('scope.dojos')).to.deep.equal(expected.stats, elog);
    expect(that('scope.totals')).to.deep.equal(expected.totals, elog);
    expect(that('scope.continentMap')).to.deep.equal(_.invert(expected.continent_codes), elog);
  });
});
