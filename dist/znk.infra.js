(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', ['pascalprecht.translate']);

})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').directive('loginForm', [
        '$translatePartialLoader',
        function ($translatePartialLoader) {
            return {
                templateUrl: 'components/loginForm/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (/*scope, element, attrs*/) {
                }
            };
        }
    ]);
})(angular);


angular.module('znk.infra.loginForm').run(['$templateCache', function($templateCache) {
  $templateCache.put("../../infra-web-app/.tmp/components/loginForm/templates/loginForm.directive.html",
    "<form novalidate class=\"form-container\">\n" +
    "    <div class=\"header\">\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"input-wrapper\">\n" +
    "        <input type=\"text\">\n" +
    "    </div>\n" +
    "    <div class=\"input-wrapper\">\n" +
    "        <input type=\"text\">\n" +
    "    </div>\n" +
    "    <div class=\"input-wrapper\">\n" +
    "        <input type=\"text\">\n" +
    "    </div>\n" +
    "</form>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', []);
})(angular);
