(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "MY_LIVE_LESSONS_POPUP":{
                            "LIVE_LESSONS_SCHEDULE": "Live Lessons Schedule",
                            "UPCOMING_LESSON": "UPCOMING LESSON",
                            "OK": "OK",
                            "NO_LIVE_LESSONS": "You didn't schedule any live lessons yet...",
                            "CURRENT_TIME": "Current Time - {{currentTime}}",
                            "RESCHEDULE_LESSON": "Reschedule Lesson"
                        },

                        "RESCHEDULE_LESSON_MODAL": {
                            "RESCHEDULE_LESSON": "Reschedule Lesson",
                            "RESCHEDULE_REQUEST": "Reschedule Request",
                            "NOTE": "NOTE:",
                            "RESCHEDULING_FEE_PART1": "This lesson is scheduled to be held within th next",
                            "RESCHEDULING_FEE_PART2": "rescheduling it will incur rescheduling fee.",
                            "HOURS": "48 HOURS,",
                            "HELLO": "Hello,",
                            "THANKS": "Thanks,",
                            "WE_WILL_CONTACT_YOU": "We will contact you shortly to reschedule the lesson at your convenience",
                            "CANCEL": "CANCEL",
                            "SEND": "SEND",
                            "SUCCESS_SHARED": "Successfully sent",
                            "DONE": "Done",
                            "MESSAGE": "Hello,\r\n\r\nI would like to reschedule my lesson with {{teacherName}}\r\nschedules for {{lessonDate}}\r\n\r\nThanks,\r\n{{studentName}}."
                        },

                        "UPCOMING_LESSON_TOAST":{
                            "YOUR_UPCOMING_LESSON_WITH": "Your upcoming lesson with",
                            "MY_LIVE_LESSONS_SCHEDULE": "My Live Lessons Schedule",
                            "RESCHEDULE": "Reschedule"
                        }
                    }
                );
            });
})(angular);
