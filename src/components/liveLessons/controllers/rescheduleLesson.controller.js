(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').controller('RescheduleLessonController',
        function ($mdDialog, lessonData, studentData, $filter, ENV, $translate, MailSenderService, MyLiveLessons, $translatePartialLoader) {
            'ngInject';

            $translatePartialLoader.addPart('liveLessons');

            var self = this;
            self.closeDialog = $mdDialog.cancel;

            var currentTimeStamp = new Date().getTime();
            var FORTY_EIGHT_HOURS = 172800000;
            var MAIL_TO_SEND = 'zoe@zinkerz.com';
            var TEMPLATE_KEY = 'reschedule';

            if (currentTimeStamp + FORTY_EIGHT_HOURS > lessonData.startTime) {
                self.islessonInNextFortyEightHours = true;
            }

            var localTimeZone = MyLiveLessons.getLocalTimeZone();
            var studentName = studentData.studentProfile.nickname;
            var localStartTimeLesson = $filter('date')(lessonData.startTime, 'MMMM d, h:mma') + localTimeZone;
            var emailBodyMessageVars = {
                teacherName: lessonData.educatorName,
                lessonDate: localStartTimeLesson,
                studentName: studentName
            };

            $translate('RESCHEDULE_LESSON_MODAL.MESSAGE', emailBodyMessageVars).then(function (message) {
                self.message = message;
            });

            var rescheduleRequest = '';
            $translate('RESCHEDULE_LESSON_MODAL.RESCHEDULE_REQUEST', emailBodyMessageVars).then(function (rescheduleRequestText) {
                rescheduleRequest = rescheduleRequestText;
            });

            // add to message body student email, uid and original lesson time
            var originStartTime = lessonData.originStartTime;
            var originTimeZone = MyLiveLessons.getCdtOrCst();
            var ADD_TO_MESSAGE = '\r\n\r\n' + 'email: ' + studentData.studentProfile.email + ' | ';
            ADD_TO_MESSAGE += '\r\n' + 'uid: ' + studentData.userId + ' | ';
            ADD_TO_MESSAGE += '\r\n' + 'original time: ' + originStartTime;
            ADD_TO_MESSAGE += ' ' + originTimeZone;

            self.send = function () {
                // subject format: Resquedule Request- [Student Name] | [Teacher Name] | [Lesson Time]
                var emailSubject = rescheduleRequest;
                emailSubject += ' - ' + studentName;
                emailSubject += ' | ' + lessonData.educatorName;
                emailSubject += ' | ' + localStartTimeLesson;

                var message = self.message + ADD_TO_MESSAGE;

                var dataToSend = {
                    emails: [MAIL_TO_SEND],
                    message: message,
                    subject: emailSubject,
                    appName: ENV.firebaseAppScopeName,
                    templateKey: TEMPLATE_KEY
                };

                MailSenderService.postMailRequest(dataToSend).then(function () {
                    self.requestWasSent = true;
                });
            };
        }
    );
})(angular);
