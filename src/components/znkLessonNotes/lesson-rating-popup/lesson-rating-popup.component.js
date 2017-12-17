(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonRatingPopup', {
            bindings: {
                lesson: '=',
                lessonSummary: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating-popup.template.html',
            controllerAs: 'vm',
            controller: function ($log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonRatingPopup: Init with lesson: ', this.lesson );
                    $log.debug('lessonRatingPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};
                    this.closeModal = $mdDialog.cancel;
                    this.showSpinner = false;
                    this.userContext = UserTypeContextEnum.STUDENT.enum;
                };

                this.submit = () => {
                    this.showSpinner = true;
                    $log.debug('saving lessonSummary : ', this.lessonSummary);
                    ZnkLessonNotesSrv.saveLessonSummary(this.lessonSummary)
                        .then(updatedLessonSummary => {
                            this.lessonSummary = updatedLessonSummary;
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: saveLessonSummary failed. Error: ', err));

                };

                this.closeModal = () => {
                    $mdDialog.cancel();
                };
            }
        });
})(angular);
