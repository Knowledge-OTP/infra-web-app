(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonNotesPopup', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-notes-popup.template.html',
            controllerAs: 'vm',
            controller: function ($log, $mdDialog, $translate, ZnkLessonNotesSrv, UserTypeContextEnum, LessonStatusEnum,
                                  LessonNotesStatusEnum, ZnkToastSrv) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonNotesPopup: Init with Lesson: ', this.lesson);
                    this.showSpinner = false;
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    this.lesson.lessonNotes.status = this.lesson.lessonNotes.status || LessonNotesStatusEnum.PENDING_NOTES.enum;
                };

                this.submit = () => {
                    $log.debug('saving lesson : ', this.lesson);
                    this.showSpinner = true;
                    ZnkLessonNotesSrv.sendEmail()
                        .then(() => {
                            // update lesson status
                            this.lesson.status = this.lesson.status === LessonStatusEnum.SCHEDULED.enum ?
                                LessonStatusEnum.ATTENDED.enum : this.lesson.status;
                            // update sendMailTime and lessonNotes status only if email sent
                            this.lesson.lessonNotes.sendMailTime = new Date().getTime();
                            this.lesson.lessonNotes.status = this.lesson.lessonNotes.status === LessonNotesStatusEnum.PENDING_NOTES.enum ?
                                LessonNotesStatusEnum.COMPLETE.enum : this.lesson.lessonNotes.status;
                            this.saveLesson();
                        })
                        .catch(err => {
                            $log.error('lessonNotesPopup: sendEmail failed. Error: ', err);
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.SEND_MAIL_FAILED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('error', message);
                            });
                            this.doItLater();
                        });

                };

                this.doItLater = () => {
                    this.saveLesson();
                };

                this.saveLesson = () => {
                    ZnkLessonNotesSrv.updateLesson(this.lesson)
                        .then(updatedLesson => {
                            this.lesson = updatedLesson.data;
                            this.showSpinner = false;
                            $mdDialog.cancel();
                        })
                        .catch(err => {
                            this.showSpinner = false;
                            $log.error('lessonNotesPopup: updateLesson failed. Error: ', err);
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.UPDATE_LESSON_FAILED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('error', message);
                            });
                        });
                };
            }
        });
})(angular);
