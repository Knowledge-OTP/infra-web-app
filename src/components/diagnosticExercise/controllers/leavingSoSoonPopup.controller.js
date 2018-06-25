(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('leavingSoSoonPopupCtrl',

            function ($log, $mdDialog, WorkoutsDiagnosticFlow, ENV, AuthService, $window, $state) {
                'ngInject';

                const vm = this;
                const MIN_IN_MILISEC = 60000; // minute in milliseconds = 60000
                const HOUR_IN_MILISEC = 3600000; // Hour in milliseconds = 3600000

                $log.debug('leavingSoSoonPopup: Init');
                vm.userEmail = '';
                vm.userTimeout = HOUR_IN_MILISEC;
                vm.selectedBtnTimeoutElm = 'btnNum3';
                vm.emailErr = false;

                vm.setNotifyTime = function (userTimeout, type, btnId) {
                    // for toggle "selected" class
                    vm.selectedBtnTimeoutElm = btnId;

                    switch (type) {
                        case 'min':
                            vm.userTimeout = userTimeout * MIN_IN_MILISEC;
                            break;
                        case 'hour':
                            vm.userTimeout = userTimeout * HOUR_IN_MILISEC;
                            break;
                    }
                };

                vm.sendReminder = function (userTimeout, email) {
                    $log.debug('sendReminder: time, email: ', userTimeout, email);
                    if (userTimeout && email) {
                        vm.closeModal();
                        AuthService.getAuth().then(authData => {
                            WorkoutsDiagnosticFlow.setReminder(ENV.serviceId, authData.uid, userTimeout, email);
                            WorkoutsDiagnosticFlow.getMarketingToefl().then(function (marketingObj) {
                                if (marketingObj && marketingObj.status) {
                                    WorkoutsDiagnosticFlow.sendEvent('diagnostic', `Diagnostic_Reminder_Submit`, 'click', true);
                                }
                                $state.go('app.diagnostic.exercise');
                            });
                            saveFlagToSessionStorage();
                        });
                    } else if (!email) {
                        vm.emailErr = true;
                    }
                };

                vm.closeModal = function () {
                    $mdDialog.cancel();
                };

                function saveFlagToSessionStorage() {
                    if ($window.sessionStorage) {
                        $window.sessionStorage.setItem('isReminderSent', JSON.stringify(true));
                    }
                }

            }
        );
})(angular);
