(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').factory('UserLiveSessionStateEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['NONE', 1, 'none'],
                ['STUDENT', 2, 'student'],
                ['EDUCATOR', 3, 'educator']
            ]);
        }
    );
})(angular);

