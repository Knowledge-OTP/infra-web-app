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
            localStorage.setItem('email', 'ofir+actEdu@zinkerz.com');
            localStorage.setItem('password', '123123');
            localStorage.setItem('dataDbPath', 'https://act-dev.firebaseio.com/');
            localStorage.setItem('studentPath', '/act_app');
            localStorage.setItem('teacherPath', '/act_dashboard');
        })
        .decorator('AuthService', function ($delegate) {
            'ngInject';
            $delegate.getAuth = function () {
                return new Promise(resolve => resolve({ uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540' }));
            };
            return $delegate;
        })
        .controller('Main', function (ZnkLessonNotesSrv) {
            'ngInject';
            const vm = this;
            vm.openLessonNotesPopup = ZnkLessonNotesSrv.openLessonNotesPopup;

            vm.lesson = {
                "id": "d374bd3b-5fe9-4eda-8bb0-4e3065e554e8",
                "date": 1509357600000,
                "startTime": 1509357600000,
                "endTime": 1509361200000,
                "students": {
                    "f04432a9-809d-4b24-a3c0-28e373f16e34": {
                        "uid": "f04432a9-809d-4b24-a3c0-28e373f16e34",
                        "firstName": "Alex",
                        "lastName": "Choroshin"
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
                "createdBy": "f04432a9-809d-4b24-a3c0-28e373f16e34",
                "educatorId": "f04432a9-809d-4b24-a3c0-28e373f16e34",
                "educatorFirstName": "Alex",
                "educatorLastName": "Choroshin",
                "_rid": "+pE+AOx3OQB+DgAAAAAAAA==",
                "_self": "dbs/+pE+AA==/colls/+pE+AOx3OQA=/docs/+pE+AOx3OQB+DgAAAAAAAA==/",
                "_etag": "\"00000976-0000-0000-0000-59f7721c0000\"",
                "_attachments": "attachments/",
                "_ts": 1509388828
            }

        });
})(angular);
