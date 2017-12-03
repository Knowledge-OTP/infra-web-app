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

                this.$onInit = () =>  {
                    this.sessionSubjects = LiveSessionSubjectSrv.getLiveSessionTopics();
                    this.closeModal = $mdDialog.cancel;
                };

                this.startSession = (sessionSubject) => {
                    let lessonData = { sessionSubject: sessionSubject };
                    LiveSessionSrv.startLiveSession(this.student, lessonData);
                };
            }
        });
})(angular);
