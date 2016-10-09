(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').controller('UpcomingLessonToasterController',
        function ($mdToast, MyLiveLessons, closestLiveLesson, $timeout, $translatePartialLoader) {
        'ngInject';

            $translatePartialLoader.addPart('liveLessons');

            var self = this;

            $timeout(function () {
                self.animateToast = true;
            });

            self.closeToast = function () {
                $mdToast.hide();
            };

            self.closestLiveLesson = closestLiveLesson;

            self.openMyLessonsPopup = function () {
                $mdToast.hide();
                MyLiveLessons.liveLessonsScheduleModal();
            };

            self.openRescheduleModal = function (lessonObj) {
                $mdToast.hide();
                MyLiveLessons.rescheduleModal(lessonObj);
            };
        }
    );
})(angular);
