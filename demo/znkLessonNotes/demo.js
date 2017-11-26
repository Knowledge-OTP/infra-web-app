(function(angular) {
    'use strict';
    angular.module('demo', [
        'demoEnv',
        'znk.infra.auth',
        'pascalprecht.translate',
        'znk.infra-web-app.znkLessonNotes',
        'znk.infra-web-app.diagnostic'
        ])
        .config(function () {
            // Replace storageConfig parameters through localStorage
            localStorage.setItem('email', 'ofir+edu@zinkerz.com');
            localStorage.setItem('password', '123123');
            localStorage.setItem('dataDbPath', 'https://act-dev.firebaseio.com/');
            localStorage.setItem('studentPath', '/act_app');
            localStorage.setItem('teacherPath', '/act_dashboard');
        })
        .decorator('ENV', function ($delegate) {
            'ngInject';

            $delegate.znkBackendBaseUrl = 'https://dev-api.zinkerz.com';
            $delegate.liveSession = {
                sessionLength: 3600000,
                sessionExtendTime: 1200000,
                sessionEndAlertTime: 300000,
                marginBeforeSessionStart: 900000,
                marginAfterSessionStart: 1800000
            };

            return $delegate;
        })
        .decorator('AuthService', function ($delegate) {
            'ngInject';
            $delegate.getAuth = function () {
                return new Promise(resolve => resolve({ uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540' }));
            };
            return $delegate;
        })
        .controller('Main', function (ZnkLessonNotesUiSrv, UserTypeContextEnum) {
            'ngInject';
            const vm = this;
            vm.lesson = {
                "id": "d374bd3b-5fe9-4eda-8bb0-4e3065e554e8",
                "date": 1511280900000,
                "startTime": 1511281500000,
                "endTime": 1511285100000,
                "students": {
                    "AMIrLVjlBIZpJm7nmtXjLzdok7E2": {
                        "uid": "AMIrLVjlBIZpJm7nmtXjLzdok7E2",
                        "firstName": "OfirStudent",
                        "lastName": "Nadav"
                    }
                },
                "serviceId": "service_1",
                "topicId": "topic_2",
                "status": 2,
                "createTime": 1509388819410,
                "dbType": "lesson",
                "events": {
                    "1509388829490": {
                        "eventTypeId": 4,
                        "additionalData": "f04432a9-809d-4b24-a3c0-28e373f16e34"
                    }
                },
                "groupId": null,
                "planId": "90d77ab2-6afd-43bf-dfb3-a4bdd8d703ed",
                "recurringId": "6a33de18-f998-4a7b-492a-3102e21ea311",
                "createdBy": "PON3qfU4o0R3V9C29S9M56XCeHu1",
                "educatorId": "PON3qfU4o0R3V9C29S9M56XCeHu1",
                "educatorFirstName": "OfirEducator",
                "educatorLastName": "Nadav",
                "studentFeedback": {
                    "isTeacherLate": true,
                    "studentFreeText": "fdssdfsdfsdfsf",
                    "rating": 2,
                    "multipleChoice": [
                        "Clarity Of Explanation",
                        "Punctuality",
                        "Technical Difficulties"
                    ]
                },
            };
            // vm.userContext = UserTypeContextEnum.EDUCATOR.enum;
            vm.userContext = UserTypeContextEnum.ADMIN.enum;
            vm.openLessonNotesPopup = (lesson, userContext) => {
                ZnkLessonNotesUiSrv.openLessonNotesPopup(lesson, userContext);
            };
            vm.openLessonRatingPopup = (lesson) => {
                ZnkLessonNotesUiSrv.openLessonRatingPopup(lesson);
            };

        });
})(angular);
