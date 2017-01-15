
(function (angular) {
    'use strict';

    angular.module('demo').config(function (SubjectsSrvProvider) {

        function subjectToIndexMapGetter(SubjectEnum) {
            return [
                SubjectEnum.VERBAL.enum,
                SubjectEnum.MATH.enum,
                SubjectEnum.ESSAY.enum
            ];
        }

        SubjectsSrvProvider.setSubjectOrder(subjectToIndexMapGetter);
    });
})(angular);

