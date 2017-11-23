(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        function ($rootScope, $rootElement, $http, ENV, InfraConfigSrv) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;
            let liveSessionDurationPath = '/settings/liveSessionDuration/';

            this.getLessonById = (lessonId) => {
                let getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            };

            this.getLessonsByStudentIds = (studentIds, dateRange, educatorId) => {
                return $http.post(`${schedulingApi}/getLessonsByStudentIds`, {studentIds, dateRange, educatorId});
            };

            this.updateLesson = (lessonToUpdate) => {
                let updateLessonApi = `${schedulingApi}/updateLessons`;
                return $http.post(updateLessonApi, [lessonToUpdate]).then(lessonArr => {
                    return Promise.resolve(lessonArr[0]);
                });
            };

            this.getServiceList = () => {
                return $http.get(`${serviceBackendUrl}/`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            };

            this.getGlobals = () => {
                return $http.get(`${globalBackendUrl}`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            };

            this.getUserProfiles = (uidArr) => {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr);
            };

            this.getLiveSessionSettings = () => {
                // // Todo: Firebase is not defined
                // return InfraConfigSrv.getGlobalStorage().then(storage => {
                //     return storage.get(liveSessionDurationPath);
                // });

                // Todo: implement this fn to get the settings from {{firebase-app-root}}/settings/liveSessionDuration
                const liveSessionDuration = {
                    endAlertTime : 300000,
                    extendTime : 900000,
                    length : 2700000,
                    lessonStartedLateTimeout : 300000,
                    marginAfterSessionStart : 1800000,
                    marginBeforeSessionStart : 900000
                };
                return Promise.resolve(liveSessionDuration);
            };


        }
    );
})(angular);
