(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonNotesPopup', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-notes-popup.template.html',
            controllerAs: 'vm',
            controller: function ($log, $mdDialog, $translate, ZnkLessonNotesSrv, UserTypeContextEnum, LessonStatusEnum,
                                  LessonNotesStatusEnum, ZnkToastSrv, UtilitySrv) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonNotesPopup: Init with lesson: ', this.lesson);
                    $log.debug('lessonNotesPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.showSpinner = false;
                    this.showStatusError = false;
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.isStudent = this.userContext === UserTypeContextEnum.STUDENT.enum;
                    this.lessonSummary =  this.lessonSummary || {};
                    this.lessonSummary.id = this.lessonSummary.id || UtilitySrv.general.createGuid();
                    this.lessonSummary.studentIds = this.lessonSummary.studentIds || Object.keys(this.lesson.students);
                    this.lessonSummary.educatorId = this.lessonSummary.educatorId || this.lesson.educatorId;
                    this.lessonSummary.lessonNotes = this.lessonSummary.lessonNotes || {};
                    this.lessonSummary.lessonNotes.status = this.lessonSummary.lessonNotes.status || LessonNotesStatusEnum.PENDING_COMPLETION.enum;
                };

                this.isLessonValid = (lesson) => {
                    return lesson.status === LessonStatusEnum.ATTENDED.enum || lesson.status === LessonStatusEnum.MISSED.enum;
                };

                this.submit = () => {
                    if (!this.isLessonValid(this.lesson)) {
                        this.showStatusError = true;
                        return;
                    }
                    this.showSpinner = true;
                    if (ZnkLessonNotesSrv.sendEmailIndicators.sendMailToStudents ||
                        ZnkLessonNotesSrv.sendEmailIndicators.sendMailToParents) {
                        this.lessonSummary.lessonNotes.status =
                            this.lessonSummary.lessonNotes.status === LessonNotesStatusEnum.PENDING_COMPLETION.enum ?
                                LessonNotesStatusEnum.complete : this.lessonSummary.lessonNotes.status;
                        this.saveLessonSummary(ZnkLessonNotesSrv.sendEmailIndicators);
                    } else {
                        $log.debug(`lessonNotesPopup: You didn't choose any email to send to`);
                        let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.NO_MAIL');
                        translationsProm.then(message => {
                            ZnkToastSrv.showToast('error', message);
                        });
                    }
                };

                this.doItLater = () => {
                    $mdDialog.cancel();
                };

                this.saveLessonSummary = (sendEmailIndicators) => {
                    $log.debug('saving lessonSummary : ', this.lessonSummary);
                    ZnkLessonNotesSrv.saveLessonSummary(this.lessonSummary, sendEmailIndicators)
                        .then(updatedLessonSummary => {
                            $log.debug('lessonNotesPopup saveLessonSummary:  updatedLessonSummary: ', updatedLessonSummary);
                            this.showSpinner = false;
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_SAVED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('success', message);
                            });
                            $mdDialog.cancel();
                        })
                        .catch(err => {
                            this.showSpinner = false;
                            $log.error('lessonNotesPopup: saveLessonSummary failed. Error: ', err);
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.UPDATE_LESSON_FAILED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('error', message);
                            });
                        });
                };

            }
        });
})(angular);
