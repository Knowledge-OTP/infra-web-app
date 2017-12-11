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
                    this.showSpinner = true;
                    if (ZnkLessonNotesSrv._mailsToSend.length > 0) {
                        ZnkLessonNotesSrv.sendEmails(this.lesson)
                            .then(() => {
                                let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_EMAIL_SENT');
                                translationsProm.then(message => {
                                    ZnkToastSrv.showToast('success', message);
                                });

                                this.saveLesson(this.lesson, true);
                            })
                            .catch(err => {
                                $log.error('lessonNotesPopup: sendEmail failed. Error: ', err);
                                let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.SEND_MAIL_FAILED');
                                translationsProm.then(message => {
                                    ZnkToastSrv.showToast('error', message);
                                });
                                this.doItLater();
                            });
                    } else {
                        $log.error('lessonNotesPopup: At list one email is required');
                        let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.NO_MAIL');
                        translationsProm.then(message => {
                            ZnkToastSrv.showToast('error', message);
                        });
                        this.doItLater();
                    }
                };

                this.doItLater = () => {
                    this.saveLesson(this.lesson, false);
                };

                this.saveLesson = (lesson, hasMailSent) => {
                    $log.debug('saving lesson : ', lesson);
                    lesson = hasMailSent ? this.updateLessonNotes(lesson) : lesson;
                    let updatePromArr = [];

                    if (lesson.backToBackId) {
                        ZnkLessonNotesSrv.getLessonsByBackToBackId(lesson.backToBackId)
                            .then(backToBackLessonsArr => {
                                backToBackLessonsArr.forEach(b2bLesson => {
                                    updatePromArr.push(this.updateLessonNotes(b2bLesson));
                                });
                            });
                    } else {
                        updatePromArr.push(this.updateLessonNotes(lesson));
                    }

                    Promise.all(updatePromArr)
                        .then(updatedLesson => {
                            $log.debug('lessonNotesPopup saveLesson:  updatedLessons: ', updatedLesson.data);
                            this.showSpinner = false;
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_SAVED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('success', message);
                            });
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

                this.updateLessonNotes = (lesson) => {
                    // update sendMailTime and status in lessonNotes only if email sent
                    lesson.lessonNotes.sendMailTime = new Date().getTime();
                    lesson.lessonNotes.status = lesson.lessonNotes.status === LessonNotesStatusEnum.PENDING_NOTES.enum ?
                        LessonNotesStatusEnum.COMPLETE.enum : lesson.lessonNotes.status;

                    return lesson;
                };

            }
        });
})(angular);
