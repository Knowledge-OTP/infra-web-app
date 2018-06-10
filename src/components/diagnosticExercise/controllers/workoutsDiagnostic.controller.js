(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('WorkoutsDiagnosticController', function (ENV, $state, currentState, $mdDialog, $window) {
            'ngInject';

            const EXAM_STATE = 'app.diagnostic';

            function userLeaveEvent(e) {
                e = e ? e : window.event;
                var from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName === 'HTML') {
                    openLeavingSoSoonPopup();
                }
            }

            function getFlagToSessionStorage() {
                let isReminderSent = false;
                if ($window.sessionStorage) {
                    isReminderSent = $window.sessionStorage.getItem('isReminderSent') === 'true';
                }
                return isReminderSent;
            }

            function openLeavingSoSoonPopup() {
                const isReminderSent = getFlagToSessionStorage();

                if (!isReminderSent) {
                    return $mdDialog.show({
                        controller: 'leavingSoSoonPopupCtrl',
                        controllerAs: 'vm',
                        templateUrl: 'components/diagnosticExercise/templates/leavingSoSoonPopup.template.html',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    });
                }
            }


            this.$onInit = function () {
                const isStudent = (ENV.appContext.toLowerCase()) === 'student';
                const appName = ENV.appName ? ENV.appName.split('-')[0] : null;
                if (isStudent && appName === 'toefl') {
                    // Detect when the mouse leaves the window
                    document.addEventListener('mouseout', userLeaveEvent);
                }

                $state.go(EXAM_STATE + currentState.state, currentState.params);
            };

            this.$onDestroy = function () {
                document.removeEventListener('mouseout', userLeaveEvent);
            };
        });
})(angular);

