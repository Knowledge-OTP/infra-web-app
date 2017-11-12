(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('LessonNotesStatusEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['PENDING_NOTES', 1, 'pendingNotes'],
                ['COMPLETE', 2, 'complete'],
                ['INCOMPLETE', 3, 'incomplete']
            ]);
        }
    );
})(angular);

