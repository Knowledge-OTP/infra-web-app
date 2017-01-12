(function (angular) {
    'use strict';

    angular.module('demo').config(function (TutorialsSrvProvider) {

        function subjectToIndexMapGetter(SubjectEnum) {
            return [
                SubjectEnum.VERBAL.enum,
                SubjectEnum.MATH.enum,
                SubjectEnum.ESSAY.enum
            ];
        }

        TutorialsSrvProvider.setSubjectOrder(subjectToIndexMapGetter);
    });
})(angular);

