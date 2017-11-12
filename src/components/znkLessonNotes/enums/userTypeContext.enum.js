(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('UserTypeContextEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['STUDENT', 1, 'student'],
                ['EDUCATOR', 2, 'educator'],
                ['ADMIN', 3, 'admin'],
                ['STUDENT_AND_EDUCATOR', 4, 'studentAndEducator'],
                ['PARENT', 5, 'parent']
            ]);
        }
    );
})(angular);

