(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonSummaryNote', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonSummaryNote/lessonSummaryNote.component.html',
            controllerAs: 'vm',
            controller: function ($log, UserTypeContextEnum) {
                'ngInject';

                const vm = this;
                vm.sendEmail = sendEmail;
                vm.studentsMails = [];
                vm.parentsMails = [];
                vm.mailsToSend = [];
                vm.sentDate = null;
                vm.studentsProfiles = [];
                vm.userTypeContextEnum = UserTypeContextEnum;


                this.$onInit = function () {
                    $log.debug('znkLessonSummaryNote: Init');
                    vm.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    initSummaryNote();
                    getStudentProfiles();
                };

                function initSummaryNote() {
                    if (!this.lesson.lessonNotes.educatorNotes) {
                        this.globalService.get().then(globals => {
                            this.lesson.lessonNotes.educatorNotes = globals.lessonEducatorNotesTemplate;
                        });
                    }
                }

                function getStudentProfiles() {
                    const studentsIdArr = Object.keys(this.lesson.students);
                    this.userProfileService.getUserProfiles(studentsIdArr).first().toPromise()
                        .then(studentsProfiles => {
                            this.logger.log(' studentsProfiles loaded: ', studentsProfiles);
                            this.studentsProfiles = studentsProfiles;
                            this.studentsProfiles.forEach(profile => {
                                const studentMail = profile.email || profile.userEmail || profile.authEmail;
                                this.studentsMails.push(studentMail);
                                if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                    this.parentsMails.push(profile.studentInfo.parentInfo.email);
                                }
                            });
                        });
                }

                function emailSelected(mailGroup, bool) {
                    if (mailGroup === this.userTypeContextEnum.student) {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.studentsMails) :
                            this.mailsToSend.filter( item => !this.studentsMails.includes( item ));
                    } else {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.parentsMails) :
                            this.mailsToSend.filter( item => !this.parentsMails.includes( item ));
                    }
                }

                function sendEmail() {
                    this.sentDate = new Date().getTime();
                    this.logger.log(' mailsToSend: ', this.mailsToSend);
                }
            }
        });
})(angular);
