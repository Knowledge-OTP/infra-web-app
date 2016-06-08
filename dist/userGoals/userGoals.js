(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals', [
        'znk.infra.scoring',
        'znk.infra.utility'
    ]);
})(angular);


'use strict';

angular.module('znk.infra-web-app.userGoals').provider('UserGoalsService', [function() {

        var _calcScoreFn;

        this.setCalcScoreFn = function(calcScoreFn) {
            _calcScoreFn = calcScoreFn;
        };

        this.$get = ['InfraConfigSrv', 'StorageSrv', '$q', 'ScoringService', '$injector', function (InfraConfigSrv, StorageSrv, $q, ScoringService, $injector) {
            var self = this;
            var goalsPath = StorageSrv.variables.appUserSpacePath + '/goals';
            var scoringLimits = ScoringService.getScoringLimits();
            var defaultSubjectScore = self.settings.defaultSubjectScore;
            var subjects = self.settings.subjects;

            var userGoalsServiceObj = {};

            userGoalsServiceObj.getGoals = function () {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(goalsPath).then(function (userGoals) {
                        if (angular.equals(userGoals, {})) {
                            userGoals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.setGoals = function (newGoals) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    if (arguments.length && angular.isDefined(newGoals)) {
                        return studentStorage.set(goalsPath, newGoals);
                    }
                    return studentStorage.get(goalsPath).then(function (userGoals) {
                        if (!userGoals.goals) {
                            userGoals.goals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.getCalcScoreFn = function() {
                return $q.when($injector.invoke(_calcScoreFn, self));
            };

            userGoalsServiceObj.getGoalsSettings = function() {
                 return self.settings;
            };

            function _defaultUserGoals() {
                var defaultUserGoals = {
                    isCompleted: false,
                    totalScore: scoringLimits.exam.max
                };
                angular.forEach(subjects, function(subject) {
                    defaultUserGoals[subject.name] = defaultSubjectScore;
                });
                return defaultUserGoals;
            }

            function averageSubjectsGoal(goalsObj) {
                var goalsSum = 0;
                var goalsLength = 0;
                angular.forEach(goalsObj, function(goal) {
                    if (angular.isNumber(goal)) {
                        goalsSum += goal;
                        goalsLength += 1;
                    }
                });
                return Math.round(goalsSum / goalsLength);
            }

            userGoalsServiceObj.averageSubjectsGoal = averageSubjectsGoal;

            return userGoalsServiceObj;
        }];
}]);

angular.module('znk.infra-web-app.userGoals').run(['$templateCache', function($templateCache) {

}]);
