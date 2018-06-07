(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('leavingSoSoonPopupCtrl',

            function ($log, $mdDialog, UserTypeContextEnum) {
                'ngInject';

                const vm = this;
                this.userContext = UserTypeContextEnum.STUDENT.enum;
                vm.userEmail = '';
                vm.notifyTime = '';

                vm.setNotifyTime = function (time, type) {
                    const MIN_IN_MILISEC = 60000; // minute in milliseconds = 60000
                    const HOUR_IN_MILISEC = 3600000; // Hour in milliseconds = 60000
                    switch (type) {
                        case 'min':
                            vm.notifyTime = time * MIN_IN_MILISEC;
                            break;
                        case 'hour':
                            vm.notifyTime = time * HOUR_IN_MILISEC;
                            break;
                    }
                };

                vm.sendReminder = function (time, email) {
                    console.log('sendReminder: time, email: ', time, email);
                };

                vm.closeModal = function () {
                    $mdDialog.cancel();
                };

                this.$onInit = function() {
                    $log.debug('leavingSoSoonPopup: Init');
                    this.showSpinner = false;
                };
            }
        );
})(angular);
