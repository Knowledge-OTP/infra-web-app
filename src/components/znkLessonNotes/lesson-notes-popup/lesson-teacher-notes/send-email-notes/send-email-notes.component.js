(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkSendEmailNotes', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/send-email-notes/send-email-notes.component.html',
            controllerAs: 'vm',
            controller: function ($log, ZnkLessonNotesSrv) {
                'ngInject';

                this.studentsMails = [];
                this.parentsMails = [];
                this.mailsToSend = [];
                this.studentsProfiles = [];
                this.sendMailToStudents = true;
                this.sendMailToParents = true;

                this.$onInit = function () {
                    $log.debug('SendEmailNotesComponent: Init');
                    this.emailSelectionChanged();
                };


                this.emailSelectionChanged = () => {
                    ZnkLessonNotesSrv.sendEmailIndicators = {
                        sendMailToStudents: this.sendMailToStudents,
                        sendMailToParents: this.sendMailToParents,
                    };
                };
            }
        });
})(angular);

