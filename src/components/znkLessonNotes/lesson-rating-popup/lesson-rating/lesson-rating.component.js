(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonRating', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating/lesson-rating.component.html',
            controllerAs: 'vm',
            controller: function ($log, $translate, UserTypeContextEnum) {
                'ngInject';

                this.MIN_STATR_FOR_RATING_FEEDBACK = 4;
                this.MAX_STARS = 5;
                this.starArr = [];
                this.showComponent = false;

                this.$onInit = () => {
                    $log.debug('znkLessonRating: Init');
                    this.lesson.studentFeedback = this.lesson.studentFeedback || {};
                    this.lesson.studentFeedback.studentFreeText = this.lesson.studentFeedback.studentFreeText || '';
                    this.initStarsArr();
                    if (this.lesson.studentFeedback.rating) {
                        this.ratingChanged(this.lesson.studentFeedback.rating);
                    }
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.showComponent = this.isAdmin || this.userContext === UserTypeContextEnum.STUDENT.enum;
                    this.readOnlyStudentFeedback = this.isAdmin ? this.getStudentFeedback() : null;
                };

                this.initStarsArr = () => {
                    for (let i = 0; i < this.MAX_STARS; i++) {
                        let starNum = i + 1;
                        this.starArr[i] = {
                            title: $translate.instant(`LESSON_NOTES.LESSON_RATING_POPUP.STAR${starNum}`),
                            active: (starNum === this.lesson.studentFeedback.rating),  // boolean
                            value: starNum,
                        };
                    }
                };

                this.onHover = (selectedStar, bool) => {
                    if (this.isAdmin) { return; }
                    this.starArr.forEach(star => {
                        star.hover = bool && (star.value <= selectedStar.value);
                    });
                };

                this.ratingChanged = (rating) => {
                    if (this.isAdmin) { return; }
                    $log.debug('lesson rating changed: ', rating);
                    this.starArr.forEach(star => {
                        star.active = star.value <= rating;
                    });
                    this.lesson.studentFeedback.rating = rating;
                };

                this.getStudentFeedback = () => {
                    let strToReturn = '';

                    if (this.lesson.studentFeedback.multipleChoice) {
                        strToReturn += this.lesson.studentFeedback.multipleChoice.join('; ');
                        strToReturn += '\n\r';
                        strToReturn += this.lesson.studentFeedback.studentFreeText;
                    } else {
                        strToReturn = this.lesson.studentFeedback.studentFreeText;
                    }

                    return strToReturn;
                };

            }
        });
})(angular);

