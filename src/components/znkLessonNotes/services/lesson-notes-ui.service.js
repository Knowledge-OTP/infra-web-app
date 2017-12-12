(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesUiSrv',
        function ($log, $rootScope, $rootElement, $http, ENV, $mdDialog, ZnkLessonNotesSrv, UtilitySrv) {
            'ngInject';

            this.openLessonNotesPopup = (lessonSummary, userContext) => {
                ZnkLessonNotesSrv.getLessonsByLessonSummaryId(lessonSummary.id)
                    .then(lessons => {
                        if (lessons && lessons.length) {
                            lessons.sort(UtilitySrv.array.sortByField('date'));
                        } else {
                            $log.error('openLessonNotesPopup: getLessonsByLessonSummaryId: No lessons were found with lessonSummaryId ', lessonSummary.id);
                            return;
                        }
                        $rootScope.lesson = lessons.pop();
                        $rootScope.lessonSummary = lessonSummary;
                        $rootScope.userContext = userContext;
                        $mdDialog.show({
                            template: `<lesson-notes-popup lesson-summary="lessonSummary" lesson="lesson" user-context="userContext"
                        aria-label="{{\'LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\' | translate}}"></lesson-notes-popup>`,
                            scope: $rootScope,
                            clickOutsideToClose: false,
                            escapeToClose: true
                        })
                            .catch(err => $log.error(`openLessonNotesPopup: getLessonsByLessonSummaryId: Error: ${err}`));
                    });
            };

            this.openLessonRatingPopup = (lessonSummary) => {
                ZnkLessonNotesSrv.getLessonsByLessonSummaryId(lessonSummary.id)
                    .then(lessons => {
                        if (lessons && lessons.length) {
                            lessons.sort(UtilitySrv.array.sortByField('date'));
                        } else {
                            $log.error('openLessonNotesPopup: getLessonsByLessonSummaryId: No lessons were found with lessonSummaryId ', lessonSummary.id);
                            return;
                        }
                        $rootScope.lesson = lessons.pop();
                        $rootScope.lessonSummary = lessonSummary;
                        $mdDialog.show({
                            template: `<lesson-rating-popup lesson-summary="lessonSummary" lesson="lesson"
                            aria-label="{{\'LESSON_NOTES.LESSON_RATING_POPUP.TITLE\' | translate}}"></lesson-rating-popup>`,
                            scope: $rootScope,
                            clickOutsideToClose: false,
                            escapeToClose: true
                        });
                    })
                    .catch(err => $log.error(`openLessonRatingPopup: getLessonsByLessonSummaryId: Error: ${err}`));
            };

            this.getUserFullName = (profile) => {
                if (!profile) {
                    return;
                }
                let name = '';
                name += profile.firstName ? profile.firstName + ' ' : '';
                name += profile.lastName ? profile.lastName : '';

                return name ? name : profile.nickname ? profile.nickname : profile.email.split('@')[0];
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
