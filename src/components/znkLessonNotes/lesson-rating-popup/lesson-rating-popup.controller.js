(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkLessonNotes')
        .controller('lessonRatingPopupCtrl',

            function (locals, $log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum, UtilitySrv) {
                'ngInject';

                this.lesson = locals.lesson;
                this.lessonSummary = locals.lessonSummary;
                this.userContext = UserTypeContextEnum.STUDENT.enum;
                this.lessonSummary = this.lessonSummary || {};
                this.lessonSummary.id = this.lessonSummary.id || UtilitySrv.general.createGuid();
                this.lessonSummary.dbType = this.lessonSummary.dbType || 'lessonSummary';
                this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};

                this.$onInit = function() {
                    $log.debug('lessonRatingPopup: Init with lesson: ', this.lesson );
                    $log.debug('lessonRatingPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.showSpinner = false;
                };

                this.saveStudentFeedback = function() {
                    this.showSpinner = true;
                    $log.debug('saving studentFeedback : ', this.lessonSummary.studentFeedback);
                    return ZnkLessonNotesSrv.saveStudentFeedback(this.lessonSummary.id, this.lessonSummary.studentFeedback)
                        .then(() => {
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => {
                            $log.error('lessonNotesPopup: saveLessonSummary failed. Error: ', err);
                            this.showSpinner = false;
                        });

                };

                this.closeModal = function () {
                    $mdDialog.cancel();
                };
            }
        );
})(angular);
