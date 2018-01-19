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

                // Show the topic modal to select topic in case we don't have dark lunch
                this.startSession = (sessionSubject) => {
                    liveSessionSettingsProm.then(liveSessionSettings => {
                        let liveSessionLength = liveSessionSettings.length || ENV.liveSession.length;
                        let expectedSessionEndTime = LiveSessionSrv._getRoundTime() + liveSessionLength;
                        let lessonData = { sessionSubject, expectedSessionEndTime };
                        LiveSessionSrv.startLiveSession(this.student, lessonData);
                    });

                };
            }
        });
})(angular);
