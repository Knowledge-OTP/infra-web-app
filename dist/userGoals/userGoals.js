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

    function _setCalcScoreFn(calcScoreFn) {
        _calcScoreFn = calcScoreFn;
    }

    this.setCalcScoreFn = _setCalcScoreFn;

    this.$get = ["InfraConfigSrv", "StorageSrv", "$q", "$injector", function (InfraConfigSrv, StorageSrv, $q, $injector) {
        'ngInject';
        var self = this;
        var goalsPath = StorageSrv.variables.appUserSpacePath + '/goals';
        var defaultSubjectScore = self.settings.defaultSubjectScore;
        var subjects = self.settings.subjects;
        var userGoalsServiceObj = {};

        function _getGoals() {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                return studentStorage.get(goalsPath).then(function (userGoals) {
                    if (Object.keys(userGoals).length === 0) {
                        userGoals = _defaultUserGoals();
                    }
                    return userGoals;
                });
            });
        }

        function _setGoals(newGoals) {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                if (arguments.length && typeof newGoals !== 'undefined') {
                    return studentStorage.set(goalsPath, newGoals);
                }
                return studentStorage.get(goalsPath).then(function (userGoals) {
                    if (!userGoals.goals) {
                        userGoals.goals = _defaultUserGoals();
                    }
                    return userGoals;
                });
            });
        }

        function _getCalcScoreFn() {
            return $q.when($injector.invoke(_calcScoreFn, self));
        }

        function _getGoalsSettings() {
            return self.settings;
        }

        function _getInitTotalScore() {
            var initTotalScore = 0;
            angular.forEach(subjects, function() {
                initTotalScore += defaultSubjectScore;
            });
            return initTotalScore;
        }

        function _defaultUserGoals() {
            var defaultUserGoals = {
                isCompleted: false,
                totalScore: _getInitTotalScore()
            };
            angular.forEach(subjects, function(subject) {
                defaultUserGoals[subject.name] = defaultSubjectScore;
            });
            return defaultUserGoals;
        }

        function _averageSubjectsGoal(goalsObj) {
            var goalsSum = 0;
            var goalsLength = 0;
            angular.forEach(goalsObj, function(goal) {
                if (typeof goal === 'number') {
                    goalsSum += goal;
                    goalsLength += 1;
                }
            });
            return Math.round(goalsSum / goalsLength);
        }

        userGoalsServiceObj.getGoals = _getGoals;
        userGoalsServiceObj.setGoals = _setGoals;
        userGoalsServiceObj.getCalcScoreFn = _getCalcScoreFn;
        userGoalsServiceObj.getGoalsSettings = _getGoalsSettings;
        userGoalsServiceObj.averageSubjectsGoal = _averageSubjectsGoal;

        return userGoalsServiceObj;
    }];
}]);

angular.module('znk.infra-web-app.userGoals').run(['$templateCache', function ($templateCache) {

}]);
