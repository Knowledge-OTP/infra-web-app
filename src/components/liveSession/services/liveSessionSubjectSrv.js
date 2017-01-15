(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', function (LiveSessionSubjectConst) {
        'ngInject'
        var subjects = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH];

        this.setLiveSessionSubjects = function(_subjects) {
            if (angular.isArray(_subjects) && _subjects.length) {
                subjects = _subjects;
            }
        };

        this.$get = function (UtilitySrv) {
            'ngInject';

            var LiveSessionSubjectSrv = {};

            function _getLiveSessionSubjects() {
                return subjects.map(function (subjectEnum) {
                    var subjectName = UtilitySrv.object.getKeyByValue(LiveSessionSubjectConst, subjectEnum).toLowerCase();
                    return {
                        id: subjectEnum,
                        name: subjectName,
                        iconName: 'liveSession-' + subjectName + '-icon'
                    };
                });
            }

            LiveSessionSubjectSrv.getLiveSessionSubjects = _getLiveSessionSubjects;

            return LiveSessionSubjectSrv;
        };
    });
})(angular);
