(function (angular) {
    'use strict';

    angular.module('demo').config(function (EstimatedScoreWidgetSrvProvider) {

        function subjectToIndexMapGetter(SubjectEnum){
            // return  {
            //     0: [SubjectEnum.ENGLISH.enum],
            //     1: [SubjectEnum.MATH.enum],
            //     2: [SubjectEnum.READING.enum],
            //     3: [SubjectEnum.SCIENCE.enum],
            //     4: [SubjectEnum.WRITING.enum]
            // };
            return  {
                [SubjectEnum.ENGLISH.enum]: 0,
                [SubjectEnum.MATH.enum]: 1,
                [SubjectEnum.READING.enum]: 2,
                [SubjectEnum.SCIENCE.enum]: 3,
                [SubjectEnum.WRITING.enum]: 4
            };
        }

        EstimatedScoreWidgetSrvProvider.setSubjectToIndexMapGetter(subjectToIndexMapGetter);
    });
})(angular);
