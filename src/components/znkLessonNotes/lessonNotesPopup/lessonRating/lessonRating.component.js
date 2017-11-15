(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonRating', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonRating/lessonRating.component.html',
            controllerAs: 'vm',
            controller: function ($log, $translate, UserTypeContextEnum) {
                'ngInject';

                let vm = this;

                vm.MIN_STATR_FOR_RATING_FEEDBACK = 2;
                vm.MAX_STARS = 5;
                vm.starArr = [];
                vm.showComponent = false;
                vm.onHover = onHover;
                vm.ratingChanged = ratingChanged;

                this.$onInit = function () {
                    $log.debug('znkLessonRating: Init');
                    vm.lesson.studentFeedback = vm.lesson.studentFeedback || {};
                    vm.showComponent = vm.userContext === UserTypeContextEnum.STUDENT.enum ||
                        vm.userContext === UserTypeContextEnum.ADMIN.enum;
                    initStarsArr();
                    if (!vm.lesson.studentFeedback.rating) {
                        ratingChanged(vm.lesson.studentFeedback.rating);
                    }
                    vm.lesson.studentFeedback.studentFreeText = vm.lesson.studentFeedback.studentFreeText || '';
                };

                function initStarsArr() {
                    for (let i = 0; i < vm.MAX_STARS; i++) {
                        let starNum = i + 1;
                        vm.starArr[i] = {
                            title: $translate.instant(`LESSON.LESSON_NOTES_POPUP.RATING.TITLE${starNum}`),
                            active: (starNum === vm.lesson.studentFeedback.rating),  // boolean
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
                    vm.lesson.studentFeedback.rating = rating;
                }

            }
        });
})(angular);

