(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonRatingPopup', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating-popup.template.html',
            controllerAs: 'vm',
            controller: function ($log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonRatingPopup: Init with Lesson: ', this.lesson );
                    this.closeModal = $mdDialog.cancel;
                    this.showSpinner = false;
                    this.userContext = UserTypeContextEnum.STUDENT.enum;
                };

                this.save = () => {
                    this.showSpinner = true;
                    $log.debug('saving lesson : ', this.lesson);
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
