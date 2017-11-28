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

                this.save = () => {
                    $log.debug('saving lesson : ', this.lesson);
                    this.showSpinner = true;
                    // update lessonNotes status only if email sent
                    if (this.lesson.lessonNotes.sendMailTime) {
                        this.lesson.lessonNotes.status = LessonNotesStatusEnum.COMPLETE.enum;
                    }
                    ZnkLessonNotesSrv.updateLesson(this.lesson)
                        .then(updatedLesson => {
                            this.lesson = updatedLesson.data;
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                };

                this.closeModal = () => {
                    $mdDialog.cancel();
                };
            }
        });
})(angular);
