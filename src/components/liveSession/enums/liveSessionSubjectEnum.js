(function (angular) {
    'use strict';

    var subjectEnum = {
        MATH: 0,
        ENGLISH: 5
    };

    angular.module('znk.infra-web-app.liveSession').constant('LiveSessionSubjectEnumConst', subjectEnum);

    angular.module('znk.infra-web-app.liveSession').factory('LiveSessionSubjectEnum', [
        'EnumSrv',
        function (EnumSrv) {

            return new EnumSrv.BaseEnum([
                ['MATH', subjectEnum.MATH, 'math'],
                ['ENGLISH', subjectEnum.ENGLISH, 'english']
            ]);
        }
    ]);
})(angular);
