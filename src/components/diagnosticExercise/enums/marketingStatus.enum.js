(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').factory('MarketingStatusEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['DIAGNOSTIC', 1, 'diagnostic'],
                ['GET_EMAIL', 2, 'get Email'],
                ['VALIDATE_EMAIL', 3, 'validate Email'],
                ['PRE_PURCHASE', 4, 'pre Purchase'],
                ['PURCHASED', 5, 'Purchased'],
                ['SIGNUP', 6, 'signup'],
                ['APP', 7, 'app'],
            ]);
        }
    );
})(angular);

