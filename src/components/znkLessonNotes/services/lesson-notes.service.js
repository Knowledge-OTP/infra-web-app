(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        function ($q, $log, $rootScope, $rootElement, $http, ENV) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let lessonApi = `${ENV.znkBackendBaseUrl}/lesson`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;

            this.sendEmailIndicators = {};

            this.getLessonById = (lessonId) => {
                const getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lesson => lesson.data)
                    .catch((err) => $log.error('getLessonById: Failed to get lesson summary by  id: ',
                        lessonId, ' Error: ', err));
            };

            this.getLessonSummaryById = (lessonSummaryId) => {
                const getLessonSummaryApi = `${lessonApi}/getLessonSummaryById?lessonSummaryId=${lessonSummaryId}`;
                return $http.get(getLessonSummaryApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lessonSummary => lessonSummary.data)
                    .catch((err) => $log.error('getLessonSummaryById: Failed to get lesson summary by id: ',
                        lessonSummaryId, ' Error: ', err));
            };

            this.getEducatorStudentIds = (educatorId) => {
                const getEducatorStudentIdsApi = `${schedulingApi}/getStudentsIdsByEducatorId/${educatorId}`;
                return $http.get(getEducatorStudentIdsApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lessonSummary => lessonSummary.data)
                    .catch((err) => $log.error('getEducatorStudentIds: Failed to get students by educatorId: ',
                        educatorId, ' Error: ', err));
            };

            this.getLessonsByLessonSummaryIds = (lessonSummaryIds) => {
                const getLessonsByLessonSummaryIdsApi = `${lessonApi}/getLessonsByLessonSummaryIds`;
                return $http.post(getLessonsByLessonSummaryIdsApi, lessonSummaryIds)
                    .then(lessons => lessons.data)
                    .catch((err) => $log.error('getLessonsByLessonSummaryIds: Failed to get lesson by ' +
                        'lesson summary by  ids: ', lessonSummaryIds, ' Error: ', err));
            };

            this.getLessonsByBackToBackId = (backToBackId) => {
                const getBackToBackApi = `${lessonApi}/getLessonsByBackToBackId?backToBackId=${backToBackId}`;
                return $http.get(getBackToBackApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lessons => lessons.data)
                    .catch((err) => $log.error('getLessonsByBackToBackId: Failed to get lessons by backToBackId: ',
                        backToBackId, ' Error: ', err));
            };

            this.getLessonsByStudentIds = (studentIds, dateRange, educatorId, lessonStatusList) => {
                const getLessonsByStudentIds = `${schedulingApi}/getLessonsByStudentIds`;
                return $http.post(getLessonsByStudentIds, {studentIds, dateRange, educatorId, lessonStatusList})
                    .then(lessons => lessons.data)
                    .catch((err) => $log.error('getLessonsByStudentIds: Failed to get lessons by studentIds: ',
                        studentIds, ' Error: ', err));
            };

            this.updateLesson = (lessonToUpdate) => {
                const updateLessonApi = `${schedulingApi}/updateLesson`;
                return $http.post(updateLessonApi, {lesson: lessonToUpdate, isRecurring: false})
                    .then(lessons => lessons.data[0])
                    .catch((err) => $log.error('updateLesson: Failed to update lesson: ',
                        lessonToUpdate, ' Error: ', err));
            };

            this.updateLessonsStatus = (id, newStatus, isBackToBackId) => {
                const lessonsProm = isBackToBackId ? this.getLessonsByBackToBackId(id) : this.getLessonById(id);
                // lessonsProm: Could return lessons array or single lesson
                return lessonsProm.then(lessons => {
                    lessons = isBackToBackId ? lessons : lessons ? [lessons] : null;
                    let updateLessonPromArr = [];
                    if (lessons && lessons.length) {
                        updateLessonPromArr = lessons.map(lesson => {
                            // TODO: need to validate previous status before update
                            lesson.status = newStatus;
                            return this.updateLesson(lesson);
                        });
                        return $q.all(updateLessonPromArr);
                    } else {
                        $log.error(`updateLessonsStatus: NO lessons are found with this id: ${id}, isBackToBackId: ${isBackToBackId}`);
                    }
                });
            };

            this.saveStudentFeedback = (lessonSummaryId, studentFeedback) => {
                const saveStudentFeedbackApi = `${lessonApi}/saveStudentFeedback`;
            return $http.post(saveStudentFeedbackApi, { lessonSummaryId, studentFeedback })
                .then(studentFeedback => studentFeedback.data)
                .catch((err) => $log.error('saveStudentFeedback: Failed to save studentFeedback: ',
                    studentFeedback, ' Error: ', err));
        };

            this.saveLessonSummary = (lessonSummary, sendEmailIndicators) => {
                const saveLessonSummaryApi = `${lessonApi}/saveLessonSummary`;
                return $http.post(saveLessonSummaryApi, {lessonSummary, sendEmailIndicators})
                    .then(lessonSummary => lessonSummary)
                    .catch((err) => $log.error('saveLessonSummary: Failed to save lesson summary: ',
                        lessonSummary, ' Error: ', err));
            };

            this.getServiceList = () => {
                return $http.get(`${serviceBackendUrl}/`, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(services => services.data)
                    .catch((err) => $log.error('getServiceList: Failed to get service list. Error: ', err));
            };

            this.getGlobalVariables = () => {
                return $http.get(`${globalBackendUrl}`, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(globalVariables => globalVariables.data)
                    .catch((err) => $log.error('getGlobalVariables: Failed to get global variables. Error: ', err));
            };

            this.getUserProfiles = (uidArr) => {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr)
                    .then(userProfiles => userProfiles.data)
                    .catch((err) => $log.error('getUserProfiles: Failed to get user profiles: ',
                        uidArr, ' Error: ', err));
            };

        }
    );
})(angular);
