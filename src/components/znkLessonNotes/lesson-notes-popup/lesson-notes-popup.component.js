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
            controller: function($log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum, LessonNotesStatusEnum) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonNotesPopup: Init with Lesson: ', this.lesson );
                    this.showSpinner = false;
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    this.lesson.lessonNotes.status =  this.lesson.lessonNotes.status || LessonNotesStatusEnum.PENDING_NOTES.enum;
                };

                this.submit = () => {
                    $log.debug('saving lesson : ', this.lesson);
                    this.showSpinner = true;
                    ZnkLessonNotesSrv.sendEmail().then(() => {
                        // update sendMailTime and lessonNotes status only if email sent
                        this.lesson.lessonNotes.sendMailTime = new Date().getTime();
                        this.lesson.lessonNotes.status = this.lesson.lessonNotes.status === LessonNotesStatusEnum.PENDING_NOTES.enum ?
                            LessonNotesStatusEnum.COMPLETE.enum : this.lesson.lessonNotes.status;
                        ZnkLessonNotesSrv.updateLesson(this.lesson)
                            .then(updatedLesson => {
                                this.lesson = updatedLesson.data;
                                this.showSpinner = false;
                                this.closeModal();
                            })
                            .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                    }).catch(err => this.logger.log('lessonNotesPopup: sendEmail failed. Error: ', err));

                };

                this.closeModal = () => {
                    $mdDialog.cancel();
                };
            }
        });
})(angular);
