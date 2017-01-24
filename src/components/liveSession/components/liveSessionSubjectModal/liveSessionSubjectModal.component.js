(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionSubjectModal', {
            bindings: {
                student: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionSubjectModal/liveSessionSubjectModal.template.html',
            controllerAs: 'vm',
            controller: function($mdDialog, LiveSessionSubjectSrv, LiveSessionSrv) {
                'ngInject';

                var vm = this;

                this.$onInit = function() {
                    vm.sessionSubjects = LiveSessionSubjectSrv.getLiveSessionTopics();
                    vm.closeModal = $mdDialog.cancel;
                    vm.startSession = startSession;
                };

                function startSession(sessionSubject) {
                    LiveSessionSrv.startLiveSession(vm.student, sessionSubject);
                }
            }
        });
})(angular);
