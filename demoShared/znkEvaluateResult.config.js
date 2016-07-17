(function(angular){
    angular.module('demo').config(function(ZnkEvaluateResultSrvProvider){
        ZnkEvaluateResultSrvProvider.setEvaluateResultByType(function (SubjectEnum) {
            'ngInject';

            var evaluateResultTypes = {};

            evaluateResultTypes[SubjectEnum.SPEAKING.enum] = {
                starsNum: 4,
                pointsPerStar: 1,
                evaluatePointsArr: [
                    {
                        evaluateText: "WEAK",
                        maxPoints: 1
                    },
                    {
                        evaluateText: "LIMITED",
                        maxPoints: 2
                    },
                    {
                        evaluateText: "FAIR",
                        maxPoints: 3
                    },
                    {
                        evaluateText: "GOOD",
                        maxPoints: 4
                    }
                ]
            };

            evaluateResultTypes[SubjectEnum.WRITING.enum] = {
                starsNum: 5,
                pointsPerStar: 1,
                evaluatePointsArr: [
                    {
                        evaluateText: "LIMITED",
                        maxPoints: 2
                    },
                    {
                        evaluateText: "FAIR",
                        maxPoints: 3.5
                    },
                    {
                        evaluateText: "GOOD",
                        maxPoints: 5
                    }
                ]
            };

            return evaluateResultTypes;
        });

        ZnkEvaluateResultSrvProvider.setEvaluateTypes(function(SubjectEnum) {
            'ngInject';

            var evaluateTypes = {};

            evaluateTypes[SubjectEnum.SPEAKING.enum] = {
                aliasName: 'speaking'
            };
            evaluateTypes[SubjectEnum.WRITING.enum] = {
                aliasName: 'writing'
            };

            return evaluateTypes;
        });
    });
})(angular);
