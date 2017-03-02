(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionSubjectModal', {
            bindings: {
                student: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionSubjectModal/liveSessionSubjectModal.template.html',
            controllerAs: 'vm',
            controller: function($mdDialog, LiveSessionSubjectSrv, LiveSessionSrv, LiveSessionUiSrv, DiagnosticSrv) {
                'ngInject';

                var vm = this;

                this.$onInit = function() {
                    vm.sessionSubjects = LiveSessionSubjectSrv.getLiveSessionTopics();
                    vm.closeModal = $mdDialog.cancel;
                    vm.startSession = startSession;
                };

                function startSession(sessionSubject) {
                    DiagnosticSrv.isDiagnosticCompleted().then(function (isDiagnosticCompleted) {
                        if (isDiagnosticCompleted) {
                            LiveSessionSrv.startLiveSession(vm.student, sessionSubject);
                        } else {
                            LiveSessionUiSrv.showIncompleteDiagnostic(vm.student);
                        }
                    });

                }
            }
        });
})(angular);
