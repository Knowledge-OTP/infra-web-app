(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        function ($log, $rootScope, $rootElement, $http, ENV) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let lessonApi = `${ENV.znkBackendBaseUrl}/lesson`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;

            this._mailsToSend = [];
            this._studentsProfiles = [];

            this.getLessonById = (lessonId) => {
                let getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                }).then(lesson => lesson.data);
            };

            this.getLessonSummaryById = (lessonSummaryId) => {
                let getLessonSummaryApi = `${lessonApi}/getLessonSummaryById?lessonSummaryId=${lessonSummaryId}`;
                return $http.get(getLessonSummaryApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                }).then(lessonSummary => lessonSummary.data);
            };

            this.getLessonsByLessonSummaryIds = (lessonSummaryIds) => {
                let getLessonsByLessonSummaryIdsApi = `${lessonApi}/getLessonsByLessonSummaryIds`;
                return $http.post(getLessonsByLessonSummaryIdsApi, lessonSummaryIds)
                    .then(lessons => lessons.data);
            };

            this.getLessonsByBackToBackId = (backToBackId) => {
                let getBackToBackApi = `${lessonApi}/getLessonsByBackToBackId?backToBackId=${backToBackId}`;
                return $http.get(getBackToBackApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                }).then(lessons => lessons.data);
            };

            this.getLessonsByStudentIds = (studentIds, dateRange, educatorId) => {
                return $http.post(`${schedulingApi}/getLessonsByStudentIds`, {studentIds, dateRange, educatorId})
                    .then(lessons => lessons.data);
            };

            this.updateLesson = (lessonToUpdate) => {
                let updateLessonApi = `${schedulingApi}/updateLesson`;
                return $http.post(updateLessonApi, {lesson: lessonToUpdate, isRecurring: false})
                    .then(lessons => lessons.data[0]);
            };

            this.updateLessonsStatus = (id, newStatus, isBackToBackId) => {
                let lessonsProm = isBackToBackId ? this.getLessonsByBackToBackId(id) : this.getLessonById(id);
                return lessonsProm.then(lessons => {
                    let updateLessonPromArr = [];
                    if (lessons && lessons.length) {
                        updateLessonPromArr = lessons.map(lesson => {
                            // TODO: need to validate previous status before update
                            lesson.status = newStatus;
                            return this.updateLesson(lesson);
                        });
                        return Promise.all(updateLessonPromArr);
                    } else {
                        $log.error(`updateLessonsStatus: NO lessons are found with this id: ${id}, isBackToBackId: ${isBackToBackId}`);
                    }
                });

            };

            this.saveLessonSummary = (lessonSummary) => {
                let saveLessonSummaryApi = `${lessonApi}/saveLessonSummary`;
                return $http.post(saveLessonSummaryApi, lessonSummary)
                    .then(lessonSummary => lessonSummary.data);
            };

            this.getServiceList = () => {
                return $http.get(`${serviceBackendUrl}/`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                }).then(services => services.data);
            };

            this.getGlobalVariables = () => {
                return $http.get(`${globalBackendUrl}`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                }).then(globalVariables => globalVariables.data);
            };

            this.getUserProfiles = (uidArr) => {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr)
                    .then(userProfiles => userProfiles.data);
            };

            this.sendEmails = (lesson, lessonSummary) => {
                if (this._mailsToSend.length) {
                    const mailPromArr = [];
                    return this.getServiceList().then(serviceList => {
                        $log.debug('mailsToSend: ', this._mailsToSend);
                        const lessonService = serviceList[lesson.serviceId];
                        const topicName = lessonService.topics[lesson.topicId].name;
                        const mailTemplateParams = {
                            date: lesson.date,
                            startTime: lessonSummary.startTime,
                            service: lessonService.name,
                            topic: topicName,
                            status: lesson.status,
                            educatorFirstName: lesson.educatorFirstName,
                            educatorLastName: lesson.educatorLastName,
                            educatorNotes: lessonSummary.lessonNotes.educatorNotes
                        };

                        this._studentsProfiles.forEach(profile => {
                            mailTemplateParams.studentFirstName = profile.firstName || '';
                            const emails = [];
                            const studentMail = profile.email || profile.userEmail || profile.authEmail;
                            if (studentMail) {
                                emails.push(studentMail);
                            }
                            if (lessonSummary.lessonNotes.sentMailToParents) {
                                const parentMail = profile.studentInfo && profile.studentInfo.parentInfo ? profile.studentInfo.parentInfo.email: null;
                                if (parentMail) {
                                    emails.push(parentMail);
                                }
                            }
                            // TODO: implement sendEmail service
                            // Mailer.prototype.sendEmail = function(emails,params,templateName, imageAttachment, replyToEmail, dontSendEmail, options)
                            mailPromArr.push($http.post('MAILER_API', { emails: emails, params: mailTemplateParams }));
                        });

                        // return Promise.all(mailPromArr);  uncomment when mailer api is available
                        return Promise.resolve('mail sent');

                    });
                } else {
                    $log.error('sendEmails: At list one email is required');
                    return Promise.reject('At list one email is required');
                }
            };
        }
    );
})(angular);
