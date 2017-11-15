(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonSummaryNote', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonSummaryNote/lessonSummaryNote.component.html',
            controllerAs: 'vm',
            controller: function ($log, UserTypeContextEnum, ZnkLessonNotesSrv) {
                'ngInject';

                let vm = this;

                vm.studentsMails = [];
                vm.parentsMails = [];
                vm.mailsToSend = [];
                vm.sentDate = null;
                vm.studensMail = false;
                vm.parentsMail = false;
                vm.studentsProfiles = [];
                vm.showComponent = false;
                vm.userTypeContextEnum = UserTypeContextEnum;
                vm.emailSelected = emailSelected;
                vm.sendEmail = sendEmail;

                this.$onInit = function () {
                    $log.debug('znkLessonSummaryNote: Init');
                    vm.showComponent = vm.userContext === UserTypeContextEnum.EDUCATOR.enum ||
                        vm.userContext === UserTypeContextEnum.ADMIN.enum;
                    vm.lesson.lessonNotes = vm.lesson.lessonNotes || {};
                    initSummaryNote();
                    getStudentProfiles();
                };

                function initSummaryNote() {
                    if (!vm.lesson.lessonNotes.educatorNotes) {
                        ZnkLessonNotesSrv.getGlobals().then(globals => {
                            vm.lesson.lessonNotes.educatorNotes = globals.data.lessonEducatorNotesTemplate;
                        });
                    }
                }

                function getStudentProfiles() {
                    if (vm.lesson.students) {
                        let studentsIdArr = Object.keys(vm.lesson.students);
                        ZnkLessonNotesSrv.getUserProfiles(studentsIdArr)
                            .then(studentsProfiles => {
                                $log.debug(' studentsProfiles loaded: ', studentsProfiles.data);
                                vm.studentsProfiles = studentsProfiles.data;
                                vm.studentsProfiles.forEach(profile => {
                                    let studentMail = profile.email || profile.userEmail || profile.authEmail;
                                    vm.studentsMails.push(studentMail);
                                    if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                        vm.parentsMails.push(profile.studentInfo.parentInfo.email);
                                    }
                                });
                            });
                    } else {
                        $log.error('getStudentProfiles: No students in this lesson. lessonId: ', vm.lesson.id);
                    }

                }

                function emailSelected(mailGroup, bool) {
                    if (mailGroup === UserTypeContextEnum.STUDENT.enum) {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.studentsMails) :
                            vm.mailsToSend.filter( item => !vm.studentsMails.includes( item ));
                        vm.lesson.lessonNotes.sentMailToStudents = bool;
                    } else {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.parentsMails) :
                            vm.mailsToSend.filter( item => !vm.parentsMails.includes( item ));
                        vm.lesson.lessonNotes.sentMailToParents = bool;
                    }
                }

                function sendEmail() {
                    vm.lesson.lessonNotes.sendMailTime = new Date().getTime();
                    $log.debug('mailsToSend: ', vm.mailsToSend);
                }
            }
        });
})(angular);
