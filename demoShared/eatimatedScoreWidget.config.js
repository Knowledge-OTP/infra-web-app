(function (angular) {
    'use strict';

    angular.module('demo').config(function (estimatedScoreWidgetProvider) {
        estimatedScoreWidgetProvider.subjects = {
            [SubjectEnum.ENGLISH.enum]: 0,
            [SubjectEnum.MATH.enum]: 1,
            [SubjectEnum.READING.enum]: 2,
            [SubjectEnum.SCIENCE.enum]: 3,
            [SubjectEnum.WRITING.enum]: 4
        }
    });
})(angular);
