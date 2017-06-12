(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.notification', [
        'znk.infra-web-app.planNotification',
        'znk.infra.auth',
        'znk.infra.storage'
    ]);
})(angular);
