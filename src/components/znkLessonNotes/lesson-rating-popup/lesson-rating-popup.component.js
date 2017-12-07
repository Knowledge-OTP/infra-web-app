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
                    let updatePromArr = [];

                    if (this.lesson.backToBackId) {
                        ZnkLessonNotesSrv.getLessonsByBackToBackId(this.lesson.backToBackId)
                            .then(backToBackLessonsRes => {
                                let backToBackLessonsArr = backToBackLessonsRes.data;
                                backToBackLessonsArr.forEach(b2bLesson => {
                                    updatePromArr.push(this.updateStudentFeedback(this.lesson, b2bLesson));
                                });
                            });
                    } else {
                        updatePromArr.push(ZnkLessonNotesSrv.updateLesson(this.lesson));
                    }

                    Promise.all(updatePromArr)
                        .then(updatedLesson => {
                            this.lesson = updatedLesson.data;
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson/s failed. Error: ', err));
                };

                this.updateStudentFeedback = (currentLesson, b2bLesson) => {
                    b2bLesson.studentFeedback = currentLesson.studentFeedback;
                    return b2bLesson;
                };

                this.closeModal = () => {
                    $mdDialog.cancel();
                };
            }
        });
})(angular);
