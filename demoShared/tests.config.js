(function (angular) {
    'use strict';

    angular.module('demo').config(function (TestsSrvProvider) {

        function subjectsOrderGetter(SubjectEnum) {
            return {
                subjects: [
                    {
                        id: SubjectEnum.VERBAL.enum,
                        name: SubjectEnum.VERBAL.val,
                        subjectIconName: SubjectEnum.VERBAL.val + '-icon'
                    },
                    {
                        id: SubjectEnum.MATH.enum,
                        name: SubjectEnum.MATH.val,
                        subjectIconName: SubjectEnum.MATH.val + '-icon'
                    },
                    {
                        id: SubjectEnum.ESSAY.enum,
                        name: SubjectEnum.ESSAY.val,
                        subjectIconName: SubjectEnum.ESSAY.val + '-icon'
                    }
                ]
            };
        }

        TestsSrvProvider.setSubjectsOrder(subjectsOrderGetter);
    });
})(angular);
