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
                                  LessonNotesStatusEnum, ZnkToastSrv) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonNotesPopup: Init with lesson: ', this.lesson);
                    $log.debug('lessonNotesPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.showSpinner = false;
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.lessonSummary =  this.lessonSummary || {};
                    this.lessonSummary.lessonNotes = this.lessonSummary.lessonNotes || {};
                    this.lessonSummary.lessonNotes.status = this.lessonSummary.lessonNotes.status || LessonNotesStatusEnum.PENDING_NOTES.enum;
                };

                this.submit = () => {
                    this.showSpinner = true;
                    if (ZnkLessonNotesSrv._mailsToSend.length > 0) {
                        ZnkLessonNotesSrv.sendEmails(this.lesson, this.lessonSummary)
                            .then(() => {
                                let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_EMAIL_SENT');
                                translationsProm.then(message => {
                                    ZnkToastSrv.showToast('success', message);
                                });

                                this.saveLessonSummary(this.lessonSummary, true);
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
                    this.saveLessonSummary(this.lessonSummary, false);
                };

                this.saveLessonSummary = (lessonSummary, hasMailSent) => {
                    $log.debug('saving lessonSummary : ', lessonSummary);
                    lessonSummary = hasMailSent ? this.updateLessonNotes(lessonSummary) : lessonSummary;
                    ZnkLessonNotesSrv.saveLessonSummary(lessonSummary)
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

                this.updateLessonNotes = (lessonSummary) => {
                    // update sendMailTime and status in lessonNotes only if email sent
                    lessonSummary.lessonNotes.sendMailTime = new Date().getTime();
                    lessonSummary.lessonNotes.status = lessonSummary.lessonNotes.status === LessonNotesStatusEnum.PENDING_NOTES.enum ?
                        LessonNotesStatusEnum.COMPLETE.enum : lessonSummary.lessonNotes.status;

                    return lessonSummary;
                };

            }
        });
})(angular);
