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
            controller: function ($log, $translate, UserTypeContextEnum, ZnkLessonNotesSrv) {
                'ngInject';

                this.studentsMails = [];
                this.parentsMails = [];
                this.mailsToSend = [];
                this.studentsProfiles = [];
                this.userTypeContextEnum = UserTypeContextEnum;

                this.$onInit = function () {
                    $log.debug('SendEmailNotesComponent: Init');
                    this.lessonSummary.lessonNotes.sentMailToStudents = this.lessonSummary.lessonNotes.sentMailToStudents || true;
                    this.lessonSummary.lessonNotes.sentMailToParents = this.lessonSummary.lessonNotes.sentMailToParents || true;
                    this.getStudentProfiles().then(studentsProfiles => {
                        $log.debug(' studentsProfiles loaded: ', studentsProfiles);
                        this.studentsProfiles = studentsProfiles;
                        ZnkLessonNotesSrv._studentsProfiles = studentsProfiles;
                        this.loadStudentsAndParentEmail(studentsProfiles);
                        this.emailSelected(UserTypeContextEnum.STUDENT.enum, this.lessonSummary.lessonNotes.sentMailToStudents);
                        this.emailSelected(UserTypeContextEnum.PARENT.enum, this.lessonSummary.lessonNotes.sentMailToParents);
                    });
                };

                this.getStudentProfiles = () => {
                    const studentsIdArr = Object.keys(this.lesson.students);
                     return ZnkLessonNotesSrv.getUserProfiles(studentsIdArr);
                };

                this.emailSelected = (mailGroup, bool) => {
                    if (mailGroup === UserTypeContextEnum.STUDENT.enum) {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.studentsMails) :
                            this.mailsToSend.filter( item => !this.studentsMails.includes( item ));
                        this.lessonSummary.lessonNotes.sentMailToStudents = bool;
                    } else {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.parentsMails) :
                            this.mailsToSend.filter( item => !this.parentsMails.includes( item ));
                        this.lessonSummary.lessonNotes.sentMailToParents = bool;
                    }
                    ZnkLessonNotesSrv._mailsToSend = this.mailsToSend;
                };

                this.loadStudentsAndParentEmail =(studentsProfiles) => {
                    studentsProfiles.forEach(profile => {
                        const studentMail = profile.email || profile.userEmail || profile.authEmail;
                        this.studentsMails.push(studentMail);
                        if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                            this.parentsMails.push(profile.studentInfo.parentInfo.email);
                        }
                    });
                };

            }
        });
})(angular);

