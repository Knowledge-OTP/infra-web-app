(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('WorkoutsDiagnosticController', function($state, currentState, $mdDialog) {
        'ngInject';

        var EXAM_STATE = 'app.diagnostic';

            function userLeaveEvent(e) {
                e = e ? e : window.event;
                var from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName === "HTML") {
                    openLeavingSoSoonPopup();
                }
            }

            function openLeavingSoSoonPopup() {
                return $mdDialog.show({
                    controller: 'leavingSoSoonPopupCtrl',
                    controllerAs: 'vm',
                    templateUrl: 'components/diagnosticExercise/templates/leavingSoSoonPopup.template.html',
                    clickOutsideToClose: true,
                    escapeToClose: true
                });
            }

            this.$onInit = function() {
                // Detect when the mouse leaves the window
                document.addEventListener('mouseout', userLeaveEvent);

                $state.go(EXAM_STATE + currentState.state, currentState.params);
            };

            this.$onDestroy = function () {
                document.removeEventListener('mouseout', userLeaveEvent);
            };
    });
})(angular);

