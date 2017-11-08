(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        function ($http, ENV, $mdDialog, InfraConfigSrv) {
            'ngInject';

            // TODO: move to ENV
            let znkBackendBaseUrl = 'https://dev-api.zinkerz.com';
            let schedulingApi = `${znkBackendBaseUrl}/scheduling`;
            let serviceBackendUrl = `${znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${znkBackendBaseUrl}/userprofile`;
            let liveSessionDurationPath = '/settings/liveSessionDuration/';
            let ZnkLessonNotesSrv = {};

            function openLessonNotesPopup() {
                $mdDialog.show({
                    template: '<lesson-notes-popup></lesson-notes-popup>',
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

            function getLessonsByQuery(query) {
                return $http.post(`${schedulingApi}/getLessonsByQuery`, query);
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
                return InfraConfigSrv.getGlobalStorage().then(function (storage) {
                    return storage.get(liveSessionDurationPath);
                });
            }

            ZnkLessonNotesSrv.openLessonNotesPopup = openLessonNotesPopup;
            ZnkLessonNotesSrv.getLessonById = getLessonById;
            ZnkLessonNotesSrv.getLessonsByQuery = getLessonsByQuery;
            ZnkLessonNotesSrv.updateLesson = updateLesson;
            ZnkLessonNotesSrv.getServiceList = getServiceList;
            ZnkLessonNotesSrv.getGlobals = getGlobals;
            ZnkLessonNotesSrv.getUserProfiles = getUserProfiles;
            ZnkLessonNotesSrv.enumToArray = enumToArray;
            ZnkLessonNotesSrv.getUserFullName = getUserFullName;
            ZnkLessonNotesSrv.getLiveSessionDuration = getLiveSessionDuration;

            return ZnkLessonNotesSrv;

        }
    );
})(angular);
