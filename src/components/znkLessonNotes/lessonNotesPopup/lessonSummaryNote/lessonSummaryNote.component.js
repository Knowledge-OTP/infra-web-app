(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonSummaryNote', {
            bindings: {
                lesson: '='
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
                vm.studentsProfiles = [];
                vm.userTypeContextEnum = UserTypeContextEnum;
                vm.emailSelected = emailSelected;
                vm.sendEmail = sendEmail;

                this.$onInit = function () {
                    $log.debug('znkLessonSummaryNote: Init');
                    vm.lesson.lessonNotes = vm.lesson.lessonNotes || {};
                    initSummaryNote();
                    getStudentProfiles();
                };

                function initSummaryNote() {
                    if (!vm.lesson.lessonNotes.educatorNotes) {
                        ZnkLessonNotesSrv.getGlobals().then(globals => {
                            vm.lesson.lessonNotes.educatorNotes = globals.lessonEducatorNotesTemplate;
                        });
                    }
                }

                function getStudentProfiles() {
                    let studentsIdArr = Object.keys(vm.lesson.students);
                    ZnkLessonNotesSrv.getUserProfiles(studentsIdArr)
                        .then(studentsProfiles => {
                            $log.debug(' studentsProfiles loaded: ', studentsProfiles);
                            vm.studentsProfiles = studentsProfiles;
                            vm.studentsProfiles.forEach(profile => {
                                let studentMail = profile.email || profile.userEmail || profile.authEmail;
                                vm.studentsMails.push(studentMail);
                                if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                    vm.parentsMails.push(profile.studentInfo.parentInfo.email);
                                }
                            });
                        });
                }

                function emailSelected(mailGroup, bool) {
                    if (mailGroup === UserTypeContextEnum.student) {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.studentsMails) :
                            vm.mailsToSend.filter( item => !vm.studentsMails.includes( item ));
                    } else {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.parentsMails) :
                            vm.mailsToSend.filter( item => !vm.parentsMails.includes( item ));
                    }
                }

                function sendEmail() {
                    vm.sentDate = new Date().getTime();
                    $log.debug('mailsToSend: ', vm.mailsToSend);
                }
            }
        });
})(angular);
