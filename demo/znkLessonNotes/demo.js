(function (angular) {
    'use strict';
    angular.module('demo', [
        'demoEnv',
        'znk.infra.auth',
        'znk.infra.popUp',
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
                return new Promise(resolve => resolve({uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540'}));
            };
            return $delegate;
        })
        .controller('Main', function (ZnkLessonNotesUiSrv, UserTypeContextEnum, PopUpSrv) {
            'ngInject';
            const vm = this;
            vm.lesson = {
                'id': '1afe9850-5415-4515-5d0d-f4be2ecc12e6',
                'date': 1515582885048,
                'students': {
                    'AMIrLVjlBIZpJm7nmtXjLzdok7E2': {
                        'uid': 'AMIrLVjlBIZpJm7nmtXjLzdok7E2',
                        'firstName': 'OfirStudent',
                        'lastName': 'Nadav'
                    }
                },
                'serviceId': 'service_1',
                'topicId': 'topic_2',
                'status': 1,
                'createTime': 1515514604629,
                'dbType': 'lesson',
                'groupId': null,
                'planId': '3d6c3052-e060-4d74-2257-0e581be83379',
                'title': 'SAT Lesson',
                'platformId': 'platform_1',
                'recurringId': '6201485e-a9be-4086-9aa6-eb321fd961e9',
                'createdBy': 'AMIrLVjlBIZpJm7nmtXjLzdok7E2',
                'educatorId': 'zAMQ9weyciZmNz5Bo2XcxgNc2ZF3',
                'educatorWage': 25,
                'wageRateId': 'standard-teacher-rate-id',
                'educatorFirstName': 'Slava',
                'educatorLastName': 'Faiman',
                'startTime': 1515539700000,
                'endTime': 1515543300000,
                'lessonSummaryId': '5ad53c05-8a64-4694-6dfe-82a528bec33d'
            };
            vm.lessonSummary = {
                id: '5ad53c05-8a64-4694-6dfe-82a528bec33d',
                'startTime': 1515539700000,
                'endTime': 1515543300000
            };
            // vm.userContext = UserTypeContextEnum.EDUCATOR.enum;
            vm.userContext = UserTypeContextEnum.ADMIN.enum;

            vm.openLessonNotesPopup = (lesson, lessonSummary, userContext) => {
                ZnkLessonNotesUiSrv.openLessonNotesPopup(lesson, lessonSummary, userContext);
            };

            vm.openLessonRatingPopup = (lesson, lessonSummary) => {;
                ZnkLessonNotesUiSrv.openLessonRatingPopup(lesson, lessonSummary);
            };

            vm.openPopup = () => {
                PopUpSrv.success('TEST POPUP');
            }

        });
})(angular);
