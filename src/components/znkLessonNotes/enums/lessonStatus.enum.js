(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('LessonStatusEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['SCHEDULED', 1, 'scheduled'],
                ['PENDING_SCHEDULE', 2, 'pendingSchedule'],
                ['CANCELED', 3, 'canceled'],
                ['ATTENDED', 4, 'attended'],
                ['MISSED', 5, 'missed']
            ]);
        }
    );
})(angular);

