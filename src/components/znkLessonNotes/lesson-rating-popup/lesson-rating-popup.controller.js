(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkLessonNotes')
        .controller('lessonRatingPopupCtrl',

            function (locals, $log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum) {
                'ngInject';

                this.lesson = locals.lesson;
                this.lessonSummary = locals.lessonSummary;
                this.userContext = UserTypeContextEnum.STUDENT.enum;
                this.lessonSummary =  this.lessonSummary || {};
                this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};

                this.$onInit = function() {
                    $log.debug('lessonRatingPopup: Init with lesson: ', this.lesson );
                    $log.debug('lessonRatingPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.showSpinner = false;
                };

                this.submit = function() {
                    this.showSpinner = true;
                    $log.debug('saving lessonSummary : ', this.lessonSummary);
                    return ZnkLessonNotesSrv.saveLessonSummary(this.lessonSummary)
                        .then(updatedLessonSummary => {
                            this.lessonSummary = updatedLessonSummary;
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: saveLessonSummary failed. Error: ', err));

                };

                this.closeModal = function () {
                    $mdDialog.cancel();
                };
            }
        );
})(angular);
