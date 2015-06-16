'use strict';

describe('login-controller', function() {

  var scope,
      ctrl,
      sandbox,
      $httpBackend,
      services,
      stubs,
      expected;

  var auth_instance;

  beforeEach(function() {
    window.logf_path = __filename;
    sandbox = sinon.sandbox.create();

    fixture.setBase('test/fixtures')
    auth_instance = fixture.load('auth.instance.json');

    angular.mock.module('cpZenPlatform', function($provide){
      $provide.value('$window', {location:{href:''}}); // gets rid of 404 warning
    });
  })

  beforeEach(inject(function(
    $rootScope,
    $controller,
    _$location_,
    _$window_,
    _$translate_,
    _$cookies_,
    _$browser_,
    _$httpBackend_,
    _alertService_,
    _auth_,
    _cdLanguagesService_
  ) {
    $httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    };

    scope = $rootScope.$new();

    // for each service, find all functions and stub them
    var map = {
      translate: _$translate_,
      alert: _alertService_,
      auth : _auth_,
      cdLanguages: _cdLanguagesService_
    };
    var res = stubAll({map: map, sandbox: sandbox, no_yield: ['showAlert'], no_stub: ['instant']});
    services = res.services;
    stubs = res.stubs;
    // specific:
    stubs.auth.instance.yields(auth_instance);
    stubs.auth.register.yields(auth_instance);
    sandbox.stub(services.translate, 'instant', function(args) { return args });

    ctrl = $controller('login', {
      $scope: scope,
      $state: {
        params: {
          id: 0
        }
      },
      $location: _$location_,
      $translate: services.translate,
      $cookies: _$cookies_,
      $window: _$window_,
      alertService: services.alert,
      auth: services.auth,
      cdLanguagesService: services.cdLanguages
    });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('core setup', function() {
    // verify calls
    expect(stubs.auth.register.callCount).to.equal(0,     logf('auth.register.callCount'));
    expect(stubs.auth.login.callCount).to.equal(0,        logf('auth.login.callCount'));
    expect(stubs.auth.reset.callCount).to.equal(0,        logf('auth.reset.callCount'));
    expect(stubs.auth.logout.callCount).to.equal(0,       logf('auth.logout.callCount'));
    expect(stubs.auth.instance.callCount).to.equal(1,     logf('auth.instance.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(0,   logf('alert.showAlert.callCount'));

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
    expect(stubs.auth.register.callCount).to.equal(1,                                   logf('auth.register.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(1,                                 logf('alert.showAlert.callCount'));
    expect(stubs.alert.showAlert.lastCall.args[0]).to.equal('login.register.success',   logf('alert.showAlert.lastCall.args'));

    // verify scope changes
    // -
  });

  it('login', function() {
    scope.loginForm = { $valid: true };
    scope.login.email = auth_instance.user.email;
    scope.login.password = auth_instance.user.password;

    scope.doLogin();

    // verify calls
    expect(stubs.auth.login.lastCall.args[0].email).to.equal(auth_instance.user.email,            logf('auth.login.lastCall.args'));
    expect(stubs.auth.login.lastCall.args[0].password).to.equal(auth_instance.user.password,      logf('auth.login.lastCall.args'));
    expect(stubs.auth.login.callCount).to.equal(1,                                                logf('auth.register.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(0,                                           logf('alert.showAlert.callCount'));

    // verify scope changes
    expect(scope.errorMessage).to.equal('', logf('scope.errorMessage'));
  });

  it('send password reset email', function() {
    scope.forgotPasswordForm = { $valid: true };
    scope.forgot.email = auth_instance.user.email;

    scope.sendPasswordResetEmail();

    // verify calls
    expect(stubs.auth.reset.lastCall.args[0].email).to.equal(auth_instance.user.email,          logf('auth.reset.lastCall.args'));
    expect(typeof stubs.auth.reset.lastCall.args[1]).to.equal('function',                       logf('auth.reset.lastCall.args'));
    expect(typeof stubs.auth.reset.lastCall.args[2]).to.equal('function',                       logf('auth.reset.lastCall.args'));
    expect(stubs.auth.reset.callCount).to.equal(1,                                              logf('auth.reset.callCount'));
    expect(stubs.alert.showAlert.callCount).to.equal(0,                                         logf('alert.showAlert.callCount'));

    // verify scope changes
    expect(scope.message).to.equal('login.msgmap.reset-sent',  logf('scope.message'));
    expect(scope.errorMessage).to.equal('',                    logf('scope.errorMessage'));
  });

  it('misc', function() {
    var view = 'login';
    scope.currentView = view;

    expect(scope.isVisible(view)).to.be.equal(true, logf('scope.isVisible(view)'));
    scope.logout();
    expect(stubs.auth.logout.callCount).to.equal(1, logf('auth.logout.callCount'));
  });
});
