'use strict';

describe('review-champion-application-controller', function() {
  logf_path = __filename;

  beforeEach(function() {
    window.sandbox = sinon.sandbox.create();
    angular.mock.module('cpZenPlatform')
  })

  beforeEach(inject(function(
    $rootScope,
    $controller,
    _$browser_,
    _$httpBackend_,
    _cdDojoService_
  ) {
    window.$httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    }

    window.scope = $rootScope.$new();

    window.services = {};
    services.cdDojo = _cdDojoService_;

    window.stubs = {
      cdDojo: {}
    };
    stubs.cdDojo.loadDojoLead = sandbox.stub(services.cdDojo, 'loadDojoLead');
    stubs.cdDojo.loadDojoLead.yields({
      application: {
        championDetails: {
          dateOfBirth: '01/01/2015',
          hasTechnicalMentorsAccess: true,
          hasVenueAccess: false
        }
      }
    });

    window.ctrl = $controller('review-champion-application-controller', {
      $scope: scope,
      $state: {
        params: {
          id: 0
        }
      },
      cdDojoService: services.cdDojo
    });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('load dojo lead', function() {
    // verify calls
    expect(that('stubs.cdDojo.loadDojoLead.callCount')).to.equal(1, elog);

    // verify scope changes
    window.ca = scope.championApplication;
    expect(that('ca.dateOfBirth')).to.equal('01/01/2015', elog);
    expect(that('ca.hasTechnicalMentorsAccess')).to.equal('Yes', elog);
    expect(that('ca.hasVenueAccess')).to.equal('No', elog);
  });
});
