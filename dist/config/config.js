(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function(){}
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('WebAppInfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var webAppInfraConfigSrv = {};
                    return webAppInfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function ($templateCache) {

}]);
