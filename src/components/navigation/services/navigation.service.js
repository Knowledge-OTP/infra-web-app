(function (angular) {
  'use strict';
  angular.module('znk.infra-web-app.navigation').service('NavigationService', function (ENV, $window) {
    'ngInject';

    var self = this;
    this.openWindowsMap = {};

    this.navigateToMyZinkerz = function (navigationRoute) {
      const serviceName = 'myzinkerz';
      const existingWindow = self.openWindowsMap[serviceName];
      if (existingWindow && !existingWindow.closed) {
        existingWindow.focus();
      } else {
        var appUrl = ENV.zinkerzWebsiteBaseUrl + serviceName + '/' + navigationRoute;
        self.openWindowsMap[serviceName] = $window.open(appUrl);
      }
    };

    this.navigateToUrl = function (url, parameter) {
      const existingUrl = self.openWindowsMap[url];
      if (existingUrl && !existingUrl.closed) {
        existingUrl.focus();
      } else {
        var navigationRoute = url + parameter ? parameter : '';
        self.openWindowsMap[url] = $window.open(navigationRoute);
      }
    };
  });
})(angular);