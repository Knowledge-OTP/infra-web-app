(function (angular) {
    'use strict';

    angular.module('demo').config(function (EstimatedScoreWidgetSrvProvider) {

        function subjectToIndexMapGetter(SubjectEnum) {
            var subjectsArr = [];
            angular.forEach(SubjectEnum, function (subjectVal, subjectId) {
                subjectsArr.push(subjectVal);
            });
            return subjectsArr;
            // return  [
            //     SubjectEnum.ENGLISH.enum,
            //     SubjectEnum.MATH.enum,
            //     SubjectEnum.READING.enum,
            //     SubjectEnum.SCIENCE.enum,
            //     SubjectEnum.WRITING.enum
            // ];
            // return  {
            //     [SubjectEnum.ENGLISH.enum]: 0,
            //     [SubjectEnum.MATH.enum]: 1,
            //     [SubjectEnum.READING.enum]: 2,
            //     [SubjectEnum.SCIENCE.enum]: 3,
            //     [SubjectEnum.WRITING.enum]: 4
            // };
        }

        EstimatedScoreWidgetSrvProvider.setSubjectToIndexMapGetter(subjectToIndexMapGetter);
    });
})(angular);
