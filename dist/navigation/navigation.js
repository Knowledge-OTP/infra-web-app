(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.navigation', [
    ]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.navigation').service('NavigationService', ["ENV", "$window", function (ENV, $window) {
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
    }]);
})(angular);

angular.module('znk.infra-web-app.navigation').run(['$templateCache', function($templateCache) {

}]);
