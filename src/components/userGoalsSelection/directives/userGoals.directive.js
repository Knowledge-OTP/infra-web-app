(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('userGoals',['UserGoalsService', '$timeout', 'UserSchoolsService', '$q', '$translatePartialLoader',
        function UserGoalsDirective(UserGoalsService, $timeout, UserSchoolsService, $q, $translatePartialLoader) {

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoalsSelection/templates/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    $translatePartialLoader.addPart('userGoalsSelection');
                    var userGoalRef;
                    var scoringSettings = UserGoalsService.getScoringSettings();
                    var goalsSettings = UserGoalsService.getGoalsSettings();
                    scope.goalsSettingsFromSrv = angular.extend({}, scoringSettings, goalsSettings);
                    var defaultTitle = scope.saveTitle = scope.setting.saveBtn.title || '.SAVE';

                    var initTotalScore = 0;
                    angular.forEach(scope.goalsSettingsFromSrv.subjects, function() {
                        initTotalScore += scope.goalsSettingsFromSrv.defaultSubjectScore;
                    });
                    scope.totalScore = initTotalScore;

                    UserGoalsService.getGoals().then(function (userGoals) {
                        userGoalRef = userGoals;
                        scope.userGoals = angular.copy(userGoals);
                    });

                    var getDreamSchoolsProm = UserSchoolsService.getDreamSchools().then(function (userSchools) {
                        scope.userSchools = angular.copy(userSchools);
                    });
                    scope.getSelectedSchools = function () {
                        return getDreamSchoolsProm.then(function () {
                            return scope.userSchools;
                        });
                    };

                    scope.showSchools = function () {
                        scope.showSchoolEdit = !scope.showSchoolEdit;
                    };

                    scope.calcTotal = function () {
                        var goals = scope.userGoals;
                        var newTotalScore = 0;
                        angular.forEach(goals, function(goal, key) {
                            if (angular.isNumber(goal) && key !== 'totalScore') {
                                newTotalScore += goal;
                            }
                        });
                        goals.totalScore = scope.totalScore = newTotalScore;
                        return goals.totalScore;
                    };

                    scope.saveChanges = function () {
                        var saveUserSchoolsProm = UserSchoolsService.setDreamSchools(scope.userSchools);

                        angular.extend(userGoalRef, scope.userGoals);
                        var saveUserGoalsProm = UserGoalsService.setGoals(userGoalRef);

                        $q.all([
                            saveUserSchoolsProm,
                            saveUserGoalsProm
                        ]).then(function () {
                            if (angular.isFunction(scope.onSave)) {
                                scope.onSave();
                            }

                            if (scope.setting.saveBtn.afterSaveTitle) {
                                scope.saveTitle = scope.setting.saveBtn.afterSaveTitle;
                                scope.showVIcon = true;
                                $timeout(function () {
                                    scope.saveTitle = defaultTitle;
                                    scope.showVIcon = false;
                                }, 3000);
                            }
                        });
                    };

                    scope.schoolSelectEvents = {
                        onSave: function (newUserDreamSchools) {
                            scope.showSchoolEdit = false;
                            scope.userSchools = newUserDreamSchools;

                            UserGoalsService.calcCompositeScore(newUserDreamSchools).then(function (newUserGoals) {
                                scope.userGoals = newUserGoals;
                            });
                        }
                    };
                }
            };

            return directive;
        }]);
})(angular);
