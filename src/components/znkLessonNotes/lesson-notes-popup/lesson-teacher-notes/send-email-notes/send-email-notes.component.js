(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkSendEmailNotes', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/send-email-notes/send-email-notes.component.html',
            controllerAs: 'vm',
            controller: function ($log, $translate, UserTypeContextEnum, ZnkLessonNotesSrv) {
                'ngInject';

                this.isStudentsMailSelected = false;
                this.isParentsMailSelected = false;
                this.studentsMails = [];
                this.parentsMails = [];
                this.mailsToSend = [];
                this.studentsProfiles = [];
                this.userTypeContextEnum = UserTypeContextEnum;

                this.$onInit = function () {
                    $log.debug('SendEmailNotesComponent: Init');
                    this.getStudentProfiles();
                };

                this.getStudentProfiles = () => {
                    const studentsIdArr = Object.keys(this.lesson.students);
                    ZnkLessonNotesSrv.getUserProfiles(studentsIdArr)
                        .then(studentsProfiles => {
                            $log.debug(' studentsProfiles loaded: ', studentsProfiles);
                            this.studentsProfiles = studentsProfiles.data;
                            this.studentsProfiles.forEach(profile => {
                                const studentMail = profile.email || profile.userEmail || profile.authEmail;
                                this.studentsMails.push(studentMail);
                                if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                    this.parentsMails.push(profile.studentInfo.parentInfo.email);
                                }
                            });
                        });
                };

                this.emailSelected = (mailGroup, bool) => {
                    if (mailGroup === UserTypeContextEnum.STUDENT.enum) {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.studentsMails) :
                            this.mailsToSend.filter( item => !this.studentsMails.includes( item ));
                        this.lesson.lessonNotes.sentMailToStudents = bool;
                    } else {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.parentsMails) :
                            this.mailsToSend.filter( item => !this.parentsMails.includes( item ));
                        this.lesson.lessonNotes.sentMailToParents = bool;
                    }
                    ZnkLessonNotesSrv._mailsToSend = this.mailsToSend;
                };

            }
        });
})(angular);

