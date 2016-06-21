(function (angular) {
    'use strict';

    angular.module('demo').config(function (EstimatedScoreWidgetSrvProvider) {

        function subjectToIndexMapGetter(SubjectEnum) {
            return [
                SubjectEnum.VERBAL.enum,
                SubjectEnum.MATH.enum,
                SubjectEnum.ESSAY.enum
            ];
        }
        
        EstimatedScoreWidgetSrvProvider.setSubjectOrder(subjectToIndexMapGetter);
    });
})(angular);
