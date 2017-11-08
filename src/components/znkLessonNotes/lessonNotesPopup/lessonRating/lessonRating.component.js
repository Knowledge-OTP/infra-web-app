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

                let vm = this;

                vm.MIN_STATR_FOR_RATING_FEEDBACK = 2;
                vm.MAX_STARS = 5;
                vm.starArr = [];
                vm.onHover = onHover;
                vm.ratingChanged = ratingChanged;

                this.$onInit = function () {
                    $log.debug('znkLessonRating: Init');
                    vm.lesson.lessonNotes = vm.lesson.lessonNotes || {};
                    initStarsArr();
                    if (!vm.lesson.lessonNotes.rating) {
                        ratingChanged(vm.lesson.lessonNotes.rating);
                    }
                    vm.lesson.lessonNotes.ratingFeedback = vm.lesson.lessonNotes.ratingFeedback || '';
                };

                function initStarsArr() {
                    for (let i = 0; i < vm.MAX_STARS; i++) {
                        let starNum = i + 1;
                        vm.starArr[i] = {
                            title: $translate.instant(`LESSON.LESSON_NOTES_POPUP.RATING.TITLE${starNum}`),
                            active: (starNum === vm.lesson.lessonNotes.rating),  // boolean
                            value: starNum,
                        };
                    }
                }

                function onHover(selectedStar, bool) {
                    vm.starArr.forEach(star => {
                        star.hover = bool && (star.value <= selectedStar.value);
                    });
                }

                function ratingChanged(rating) {
                    $log.debug('lesson rating changed: ', rating);
                    vm.starArr.forEach(star => {
                        star.active = star.value <= rating;
                    });
                    vm.lesson.lessonNotes.rating = rating;
                }

            }
        });
})(angular);

