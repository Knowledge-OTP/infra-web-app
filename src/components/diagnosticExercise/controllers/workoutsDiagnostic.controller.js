(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('WorkoutsDiagnosticController', function (ENV, $state, currentState, $mdDialog, $window, WorkoutsDiagnosticFlow) {
            'ngInject';

            const EXAM_STATE = 'app.diagnostic';

            // To prevent the openLeavingSoSoonPopup the pop when the microphone permission popup appear
            let isMicrophonePermissionAsked = null;
            let onBoardingProgressStatus;
            hasMicrophonePermissions();
            WorkoutsDiagnosticFlow.getBoardingProgressStatus().then(status => {
                onBoardingProgressStatus = status;
            });

            function hasMicrophonePermissions() {
                if (ENV.firebaseAppScopeName.split('_')[0] === 'toefl') {
                    $window.RaccoonRecorder.getMicrophoneAccess(
                        // successCallback = permission granted
                        () => isMicrophonePermissionAsked = true,
                        // errorCallback = permission denied
                        () => isMicrophonePermissionAsked = true);
                } else {
                    isMicrophonePermissionAsked = true;
                }
            }

            function userLeaveEvent(e) {
                e = e ? e : window.event;
                const from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName === 'HTML' && onBoardingProgressStatus && onBoardingProgressStatus === 4) {
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
                const isOpen = !!document.querySelector('.leaving-so-soon-popup');

                if (!isOpen && !isReminderSent && isMicrophonePermissionAsked !== null) {
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
                if (isStudent) {
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

