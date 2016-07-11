(function (angular) {
    'use strict';

    angular.module('demo').config(function (PerformanceSrvProvider) {
        function subjectsMapGetter(SubjectEnum) {
            var subjectsMap = {};
            subjectsMap[SubjectEnum.VERBAL.enum] = {
                name: SubjectEnum.VERBAL.val
            };
            subjectsMap[SubjectEnum.MATH.enum] = {
                name: SubjectEnum.MATH.val
            };
            subjectsMap[SubjectEnum.ESSAY.enum] = {
                name: SubjectEnum.ESSAY.val
            };

            return subjectsMap;
        }
        
        PerformanceSrvProvider.setSubjectsMap(subjectsMapGetter);
    });
})(angular);
