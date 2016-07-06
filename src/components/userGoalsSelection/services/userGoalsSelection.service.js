'use strict';

angular.module('znk.infra-web-app.userGoalsSelection').service('userGoalsSelectionService', ['InfraConfigSrv', 'StorageSrv', 'ENV', '$http', 'UserGoalsService', '$q', '$mdDialog',
    function(InfraConfigSrv, StorageSrv, ENV, $http, UserGoalsService, $q, $mdDialog) {
        var schoolsPath = StorageSrv.variables.appUserSpacePath + '/dreamSchools';

        this.getAppSchoolsList = function () {
            return $http.get(ENV.dreamSchoolJsonUrl, {
                timeout: ENV.promiseTimeOut,
                cache: true
            });
        };

        function _getUserSchoolsData() {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                var defaultValues = {
                    selectedSchools: []
                };
                return studentStorage.get(schoolsPath, defaultValues);
            });
        }

        function _setUserSchoolsData(userSchools) {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                 return studentStorage.set(schoolsPath, userSchools);
            });
        }

        this.getDreamSchools = function () {
            return _getUserSchoolsData().then(function (userSchools) {
                return userSchools.selectedSchools;
            });
        };

        this.openEditGoalsDialog = function (options) {
            options = angular.extend({}, {
                clickOutsideToCloseFlag: false
            }, options);
            $mdDialog.show({
                controller: 'EditGoalsController',
                controllerAs: 'vm',
                templateUrl: 'components/userGoalsSelection/templates/editGoals.template.html',
                clickOutsideToClose: options.clickOutsideToCloseFlag
            });
        };

        this.setDreamSchools = function (newSchools, updateUserGoals) {
            return _getUserSchoolsData().then(function (userSchools) {
                if (!angular.isArray(newSchools) || !newSchools.length) {
                    newSchools = [];
                }

                if (userSchools.selectedSchools !== newSchools) {
                    userSchools.selectedSchools.splice(0);
                    angular.extend(userSchools.selectedSchools, newSchools);
                }

                var saveUserGoalProm = $q.when();
                if (updateUserGoals) {
                    saveUserGoalProm = UserGoalsService.getCalcScoreFn();
                }

                return $q.all([
                    _setUserSchoolsData(userSchools),
                    saveUserGoalProm
                ]).then(function (res) {
                    var saveUserGoalFn = res[1];
                    if (angular.isFunction(saveUserGoalFn)) {
                        saveUserGoalFn(newSchools, true);
                    }
                    return res[0];
                });
            });
        };
}]);

