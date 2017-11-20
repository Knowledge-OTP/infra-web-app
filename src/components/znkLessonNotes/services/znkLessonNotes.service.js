(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        function ($rootScope, $rootElement, $http, ENV, $mdDialog, InfraConfigSrv) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;
            let liveSessionDurationPath = '/settings/liveSessionDuration/';
            let ZnkLessonNotesSrv = {};

            function openLessonNotesPopup(lessonId, userContext) {
                $rootScope.lessonId = lessonId;
                $rootScope.userContext = userContext;
                $mdDialog.show({
                    template: `<lesson-notes-popup lesson-id="lessonId" user-context="userContext"
                        aria-label="{{\'LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\' | translate}}"></lesson-notes-popup>`,
                    scope: $rootScope,
                    clickOutsideToClose: true,
                    escapeToClose: true
                });
            }

            function getLessonById(lessonId) {
                let getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            }

            function getLessonsByStudentIds(studentIds, dateRange, educatorId) {
                return $http.post(`${schedulingApi}/getLessonsByStudentIds`, {studentIds, dateRange, educatorId});
            }

            function updateLesson(lessonToUpdate) {
                let updateLessonApi = `${schedulingApi}/updateLessons`;
                return $http.post(updateLessonApi, [lessonToUpdate]).then(lessonArr => {
                    return Promise.resolve(lessonArr[0]);
                });
            }

            function getServiceList() {
                return $http.get(`${serviceBackendUrl}/`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            }

            function getGlobals() {
                return $http.get(`${globalBackendUrl}`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            }

            function getUserProfiles(uidArr) {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr);
            }

            function enumToArray(enumObj, capitalize, returnedArrType) {
                return Object.keys(enumObj).map(item => {
                    if (returnedArrType === 'number') {
                        if (typeof (parseInt(item, 10)) === 'number') {
                            return parseInt(item, 10);
                        }
                    } else if (!isNaN(parseInt(item, 10))) {
                        if (capitalize) {
                            return capitalizeFirstLetter(enumObj[item]);
                        } else {
                            return enumObj[item];
                        }
                    }
                }).filter(item => item);
            }

            function capitalizeFirstLetter(str) {
                return str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
            }

            function getUserFullName(profile) {
                if (!profile) {
                    return;
                }
                let name = '';
                name += profile.firstName ? profile.firstName + ' ' : '';
                name += profile.lastName ? profile.lastName : '';

                return name ? name : profile.nickname ? profile.nickname : profile.email.split('@')[0];
            }

            function getLiveSessionDuration() {
                return InfraConfigSrv.getGlobalStorage().then(storage => {
                    return storage.get(liveSessionDurationPath);
                });
            }

            function convertMS(ms) {
                let day, hour, min, sec;
                sec = Math.floor(ms / 1000);
                min = Math.floor(sec / 60);
                sec = sec % 60;
                hour = Math.floor(min / 60);
                min = min % 60;
                day = Math.floor(hour / 24);
                hour = hour % 24;
                return {day, hour, min, sec};
            }

            ZnkLessonNotesSrv.openLessonNotesPopup = openLessonNotesPopup;
            ZnkLessonNotesSrv.getLessonById = getLessonById;
            ZnkLessonNotesSrv.getLessonsByStudentIds = getLessonsByStudentIds;
            ZnkLessonNotesSrv.updateLesson = updateLesson;
            ZnkLessonNotesSrv.getServiceList = getServiceList;
            ZnkLessonNotesSrv.getGlobals = getGlobals;
            ZnkLessonNotesSrv.getUserProfiles = getUserProfiles;
            ZnkLessonNotesSrv.enumToArray = enumToArray;
            ZnkLessonNotesSrv.capitalizeFirstLetter = capitalizeFirstLetter;
            ZnkLessonNotesSrv.getUserFullName = getUserFullName;
            ZnkLessonNotesSrv.getLiveSessionDuration = getLiveSessionDuration;
            ZnkLessonNotesSrv.convertMS = convertMS;

            return ZnkLessonNotesSrv;

        }
    );
})(angular);
