(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('selectedTestLevel', {
            bindings: {},
            templateUrl: 'components/myProfile/components/selectedTestLevel/selectedTestLevel.template.html',
            controllerAs: 'vm',
            controller: function (AuthService, $mdDialog, $timeout, MyProfileSrv, StorageSrv, InfraConfigSrv, SubjectEnum, $filter, CategoryService) {
                'ngInject';

                var vm = this;
                var showToast = MyProfileSrv.showToast;
                var translateFilter = $filter('translate');
                vm.testLevelList = [
                    {
                        subjectId: SubjectEnum.MATHLVL1,
                        name: translateFilter('MY_PROFILE.MATH_LEVEL_1')
                    },
                    {
                        subjectId: SubjectEnum.MATHLVL2,
                        name: translateFilter('MY_PROFILE.MATH_LEVEL_2')
                    }
                ];

                CategoryService.getUserSelectedLevel1Category().then(function (selectedTestLevelData) {
                    vm.selectedTestLevel = vm.testLevelList.filter(function (item) {
                        return item.subjectId === selectedTestLevelData;
                    })[0];
                });

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.changeTestLevel = function (authform) {
                    var type, msg;

                    if (!authform.$invalid) {
                        CategoryService.setUserSelectedLevel1Category(vm.selectedTestLevel.subjectId).then(function () {
                            $timeout(function () {
                                type = 'success';
                                msg = 'MY_PROFILE.TEST_LEVEL_SAVE_SUCCESS';
                                showToast(type, msg);
                            }, 10);
                        }, function (err) {
                            $timeout(function () {
                                type = 'error';
                                if (err.code === 'NETWORK_ERROR') {
                                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                    showToast(type, msg);
                                } else {
                                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                                    showToast(type, msg);
                                }
                            }, 10);
                        });
                    }
                };

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }
        });
})(angular);
