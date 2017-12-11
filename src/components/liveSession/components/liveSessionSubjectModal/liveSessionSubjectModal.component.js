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
            controller: function (ENV, $mdDialog, LiveSessionSubjectSrv, LiveSessionSrv, ZnkLessonNotesSrv) {
                'ngInject';

                 let liveSessionSettingsProm = ZnkLessonNotesSrv.getGlobalVariables()
                     .then(globalVariables => globalVariables.liveSession);

                this.$onInit = () =>  {
                    this.sessionSubjects = LiveSessionSubjectSrv.getLiveSessionTopics();
                    this.closeModal = $mdDialog.cancel;
                };

                this.startSession = (sessionSubject) => {
                    liveSessionSettingsProm.then(liveSessionSettings => {
                        let expectedSessionEndTime = liveSessionSettings.length || ENV.liveSession.sessionLength;
                        let lessonData = { sessionSubject, expectedSessionEndTime };
                        LiveSessionSrv.startLiveSession(this.student, lessonData);
                    });

                };
            }
        });
})(angular);
