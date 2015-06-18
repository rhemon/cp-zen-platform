'use strict';

describe('login-controller', function() {
  logf_path = __filename;

  beforeEach(function() {
    window.sandbox = sinon.sandbox.create();

    fixture.setBase('test/fixtures')
    window.auth_instance = fixture.load('auth.instance.json');

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
    window.$httpBackend = _$httpBackend_;

    // Ref: https://github.com/angular/angular.js/issues/11373
    _$browser_['cookies'] = function() {
      return {};
    };

    window.scope = $rootScope.$new();

    // for each service, find all functions and stub them
    var map = {
      translate: _$translate_,
      alert: _alertService_,
      auth : _auth_,
      cdLanguages: _cdLanguagesService_
    };
    var res = stubAll({map: map, sandbox: sandbox, no_yield: ['showAlert'], no_stub: ['instant']});
    window.services = res.services;
    window.stubs = res.stubs;
    // specific:
    stubs.auth.instance.yields(auth_instance);
    stubs.auth.register.yields(auth_instance);
    sandbox.stub(services.translate, 'instant', function(args) { return args });

    window.ctrl = $controller('login', {
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

  it('init', function() {
    // verify calls
    expect(that('stubs.auth.register.callCount')).to.equal(0, elog);
    expect(that('stubs.auth.login.callCount')).to.equal(0, elog);
    expect(that('stubs.auth.reset.callCount')).to.equal(0, elog);
    expect(that('stubs.auth.logout.callCount')).to.equal(0, elog);
    expect(that('stubs.auth.instance.callCount')).to.equal(1, elog);
    expect(that('stubs.alert.showAlert.callCount')).to.equal(0, elog);

    // verify scope changes
    expect(typeof that('scope.show')).to.be.equal('function', elog);
    expect(typeof that('scope.isVisible')).to.be.equal('function', elog);
    expect(typeof that('scope.doRegister')).to.be.equal('function', elog);
    expect(typeof that('scope.doLogin')).to.be.equal('function', elog);
    expect(typeof that('scope.sendPasswordResetEmail')).to.be.equal('function', elog);
    expect(typeof that('scope.logout')).to.be.equal('function', elog);
    expect(typeof that('scope.goHome')).to.be.equal('function', elog);
    expect(that('scope.user')).to.be.equal(auth_instance.user, elog);

  });

  it('register', function() {
    scope.doRegister();

    // verify calls
    expect(that('stubs.auth.register.callCount')).to.equal(1, elog);
    expect(that('stubs.alert.showAlert.callCount')).to.equal(1, elog);
    expect(that('stubs.alert.showAlert.lastCall.args')[0]).to.equal('login.register.success', elog);

    // verify scope changes
    // -
  });

  it('login', function() {
    scope.loginForm = { $valid: true };
    scope.login.email = auth_instance.user.email;
    scope.login.password = auth_instance.user.password;

    scope.doLogin();

    // verify calls
    expect(that('stubs.auth.login.lastCall.args')[0].email).to.equal(auth_instance.user.email, elog);
    expect(that('stubs.auth.login.lastCall.args')[0].password).to.equal(auth_instance.user.password, elog);
    expect(that('stubs.auth.login.callCount')).to.equal(1, elog);
    expect(that('stubs.alert.showAlert.callCount')).to.equal(0, elog);

    // verify scope changes
    expect(that('scope.errorMessage')).to.equal('', elog);
  });

  it('send password reset email', function() {
    scope.forgotPasswordForm = { $valid: true };
    scope.forgot.email = auth_instance.user.email;

    scope.sendPasswordResetEmail();

    // verify calls
    expect(that('stubs.auth.reset.lastCall.args')[0].email).to.equal(auth_instance.user.email, elog);
    expect(typeof that('stubs.auth.reset.lastCall.args')[1]).to.equal('function', elog);
    expect(typeof that('stubs.auth.reset.lastCall.args')[2]).to.equal('function', elog);
    expect(that('stubs.auth.reset.callCount')).to.equal(1, elog);
    expect(that('stubs.alert.showAlert.callCount')).to.equal(0, elog);

    // verify scope changes
    expect(that('scope.message')).to.equal('login.msgmap.reset-sent', elog);
    expect(that('scope.errorMessage')).to.equal('', elog);
  });

  it('misc', function() {
    var view = 'login';
    scope.currentView = view;

    expect(that('scope.isVisible')(view)).to.be.equal(true, elog);
    scope.logout();
    expect(that('stubs.auth.logout.callCount')).to.equal(1, elog);
  });
});
