(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('EmailStatusEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['SENT', 1, 'sent'],
                ['NOT_SENT', 2, 'notSent'],
                ['PENDING', 3, 'pending']
            ]);
        }
    );
})(angular);

