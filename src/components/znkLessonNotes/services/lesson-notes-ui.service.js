(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesUiSrv',
        function ($log, $rootScope, $rootElement, $http, ENV, $mdDialog, LessonNotesStatusEnum) {
            'ngInject';

            this.openLessonNotesPopup = (lesson, lessonSummary, userContext) => {
                $rootScope.lesson = lesson;
                $rootScope.lessonSummary = lessonSummary;
                $rootScope.userContext = userContext;
                $mdDialog.show({
                    template: `<lesson-notes-popup lesson-summary="lessonSummary" lesson="lesson" user-context="userContext"
                        aria-label="{{\'LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\' | translate}}"></lesson-notes-popup>`,
                    scope: $rootScope,
                    clickOutsideToClose: false,
                    escapeToClose: true
                });
            };

            this.openLessonRatingPopup = (lesson, lessonSummary) => {
                $rootScope.lesson = lesson;
                $rootScope.lessonSummary = lessonSummary;
                $mdDialog.show({
                    template: `<lesson-rating-popup lesson-summary="lessonSummary" lesson="lesson"
                            aria-label="{{\'LESSON_NOTES.LESSON_RATING_POPUP.TITLE\' | translate}}"></lesson-rating-popup>`,
                    scope: $rootScope,
                    clickOutsideToClose: false,
                    escapeToClose: true
                });
            };

            this.newLessonSummary = (liveSessionData) => {
                return {
                    id: liveSessionData.lessonSummaryId,
                    startTime: liveSessionData.startTime ,
                    endTime: liveSessionData.endTime,
                    liveSessions: [liveSessionData.guid],
                    studentFeedback: null,
                    lessonNotes: {
                        status: LessonNotesStatusEnum.PENDING_COMPLETION.enum
                    },
                    dbType: 'lessonSummary'
                };
            };

            this.getUserFullName = (profile) => {
                if (!profile) {
                    return;
                }
                let name = '';
                name += profile.firstName ? profile.firstName + ' ' : '';
                name += profile.lastName ? profile.lastName : '';

                return name ? name : profile.nickname ? profile.nickname : '';
            };

            this.convertMS = (ms) => {
                let day, hour, min, sec;
                sec = Math.floor(ms / 1000);
                min = Math.floor(sec / 60);
                sec = sec % 60;
                hour = Math.floor(min / 60);
                min = min % 60;
                day = Math.floor(hour / 24);
                hour = hour % 24;
                return {day, hour, min, sec};
            };

            this.isNullOrUndefined = (obj) => {
                return typeof obj === "undefined" || obj === null;
            };

        }
    );
})(angular);
