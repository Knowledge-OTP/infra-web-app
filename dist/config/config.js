(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function($translateProvider){
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/i18n/{part}/{lang}.json'
            });
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

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
