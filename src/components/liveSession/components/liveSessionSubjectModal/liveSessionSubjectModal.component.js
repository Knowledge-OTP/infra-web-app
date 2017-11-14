(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionSubjectModal', {
            bindings: {
                student: '=',
                lessonId: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionSubjectModal/liveSessionSubjectModal.template.html',
            controllerAs: 'vm',
            controller: function ($mdDialog, LiveSessionSubjectSrv, LiveSessionSrv) {
                'ngInject';

                let vm = this;

                this.$onInit = function () {
                    vm.sessionSubjects = LiveSessionSubjectSrv.getLiveSessionTopics();
                    vm.closeModal = $mdDialog.cancel;
                    vm.startSession = startSession;
                };

                function startSession(sessionSubject) {
                    let lessonData = {topicId: sessionSubject};
                    LiveSessionSrv.startLiveSession(vm.student, lessonData);
                }
            }
        });
})(angular);
