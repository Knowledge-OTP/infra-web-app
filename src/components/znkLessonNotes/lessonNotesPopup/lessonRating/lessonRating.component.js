(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonRating', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html',
            controllerAs: 'vm',
            controller: function ($log, $translate) {
                'ngInject';

                const vm = this;

                vm.MIN_STATR_FOR_RATING_FEEDBACK = 2;
                vm.MAX_STARS = 5;
                vm.starArr = [];
                vm.onHover = onHover;
                vm.ratingChanged = ratingChanged;

                this.$onInit = function () {
                    $log.debug('znkLessonRating: Init');
                    vm.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    initStarsArr();
                    if (!vm.lesson.lessonNotes.rating) {
                        ratingChanged(this.lesson.lessonNotes.rating);
                    }
                    vm.lesson.lessonNotes.ratingFeedback = vm.lesson.lessonNotes.ratingFeedback || '';
                };

                function initStarsArr() {
                    for (let i = 0; i < this.MAX_STARS; i++) {
                        const starNum = i + 1;
                        this.starArr[i] = {
                            title: $translate.instant(`LESSON.LESSON_NOTES_POPUP.RATING.TITLE${starNum}`),
                            active: (starNum === this.lesson.lessonNotes.rating),  // boolean
                            value: starNum,
                        };
                    }
                }

                function onHover(selectedStar, bool) {
                    this.starArr.forEach(star => {
                        star.hover = bool && (star.value <= selectedStar.value);
                    });
                }

                function ratingChanged(rating) {
                    this.logger.log('lesson rating changed: ', rating);
                    this.starArr.forEach(star => {
                        star.active = star.value <= rating;
                    });
                    this.lesson.lessonNotes.rating = rating;
                }

            }
        });
})(angular);

