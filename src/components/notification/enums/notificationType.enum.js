(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.notification').factory('NotificationTypeEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['PLAN_PENDING', 1, 'plan pending']
            ]);
        }
    );
})(angular);

