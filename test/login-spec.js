'use strict';

describe('login-controller', function() {

  var scope,
    ctrl,
    sandbox,
    $httpBackend,
    services,
    stubs,
    expected;

  var auth_instance = {
      user: {
        id: '561894d7-6c80-4340-9526-d6454e115313',
        nick: 'manager@example.com',
        email: 'manager@example.com',
        name: 'Manager',
        username: null,
        activated: null,
        level: null,
        mysqlUserId: null,
        firstName: null,
        lastName: null,
        roles: ['cdf-admin'],
        phone: null,
        mailingList: 0,
        termsConditionsAccepted: null,
        when: '2015-06-05T12:55:40.424Z',
        confirmed: null,
        admin: null,
        modified: null,
        locale: null,
        banned: null,
        banReason: null
      },
      login: {
        id: '75d7fb25-4aa7-46cd-8a52-65c81e8f1b35',
        nick: 'manager@example.com',
        email: 'manager@example.com',
        user: '561894d7-6c80-4340-9526-d6454e115313',
        when: '2015-06-12T14:27:28.128Z',
        why: 'password',
        token: '75d7fb25-4aa7-46cd-8a52-65c81e8f1b35',
        active: true,
        auto: null,
        ended: null
      },
      ok: true,
      'httpredirect$': '/'
    };

  beforeEach(function() {
    window.logf_path = __filename;
    sandbox = sinon.sandbox.create();
    angular.mock.module('cpZenPlatform')
  })

  beforeEach(inject(function(
    $rootScope,
    $controller,
    _$location_,
    _$window_,
    _$browser_,
    _$httpBackend_,
    _alertService_,
    _auth_
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
      auth : _auth_
    };
    var res = stubAll({map: map, sandbox: sandbox, no_yield:['showAlert']});
    services = res.services;
    stubs = res.stubs;
    // specific:
    stubs.auth.instance.yields(auth_instance);
    stubs.auth.register.yields(auth_instance);

    ctrl = $controller('login', {
      $scope: scope,
      $state: {
        params: {
          id: 0
        }
      },
      $location: _$location_,
      $window: _$window_,
      alertService: services.alert,
      auth: services.auth
    });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('core setup', function() {

    // verify calls
    expect(stubs.auth.register.callCount).to.equal(0,   logf('auth.register.callCount'));
    expect(stubs.auth.login.callCount).to.equal(0,      logf('auth.register.callCount'));
    expect(stubs.auth.reset.callCount).to.equal(0,      logf('auth.reset.callCount'));
    expect(stubs.auth.logout.callCount).to.equal(0,     logf('auth.logout.callCount'));
    expect(stubs.auth.instance.callCount).to.equal(1,   logf('auth.instance.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(0, logf('alert.showAlert.callCount'));

    // verify scope changes
    expect(typeof scope.show).to.be.equal('function',                   logf('scope.show'));
    expect(typeof scope.isVisible).to.be.equal('function',              logf('scope.isVisible'));
    expect(typeof scope.doRegister).to.be.equal('function',             logf('scope.doRegister'));
    expect(typeof scope.doLogin).to.be.equal('function',                logf('scope.doLogin'));
    expect(typeof scope.sendPasswordResetEmail).to.be.equal('function', logf('scope.sendPasswordResetEmail'));
    expect(typeof scope.logout).to.be.equal('function',                 logf('scope.logout'));
    expect(typeof scope.goHome).to.be.equal('function',                 logf('scope.goHome'));
    expect(scope.user).to.be.equal(auth_instance.user,                  logf('scope.goHome'));
  });

  it('register', function() {
    scope.doRegister();

    // verify calls
    expect(stubs.auth.register.callCount).to.equal(1,   logf('auth.register.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(1, logf('alert.showAlert.callCount'));
    expect(stubs.alert.showAlert.lastCall.args[0].split(' ')).to.include.members(['account', 'successfully', 'created.'],
                                                        logf('alert.showAlert.lastCall.args'));

    // verify scope changes
    // -
  });

  it('login', function() {
    console.log(services.translate)

    scope.loginForm = { $valid: true };
    scope.login.email = auth_instance.user.email;
    scope.login.password = auth_instance.user.password;
    
    scope.doLogin();

    // verify calls
    console.log(stubs.auth.login.lastCall.args[0])
    expect(stubs.auth.login.callCount).to.equal(1,      logf('auth.register.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(0, logf('alert.showAlert.callCount'));

    // verify scope changes
    // -
  });
});
