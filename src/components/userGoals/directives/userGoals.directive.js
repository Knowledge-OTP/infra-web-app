(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('userGoals',['UserGoalsService', '$filter', '$timeout', 'UserSchoolsService', '$q', '$translatePartialLoader',
        function UserGoalsDirective(UserGoalsService, $filter, $timeout, UserSchoolsService, $q, $translatePartialLoader) {

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoals/templates/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    var translateFilter = $filter('translate');
                    var defaultTitle = translateFilter('USER_GOALS.SAVE');
                    var userGoalRef;
                    scope.saveTitle = scope.setting.saveBtn.title || defaultTitle;

                    $translatePartialLoader.addPart('userGoals');

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
                        goals.totalScore = goals.verbal + goals.math;
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
