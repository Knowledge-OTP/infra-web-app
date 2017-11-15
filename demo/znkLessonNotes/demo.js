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
        .controller('Main', function (ZnkLessonNotesSrv, UserTypeContextEnum) {
            'ngInject';
            const vm = this;
            vm.lessonId = 'd374bd3b-5fe9-4eda-8bb0-4e3065e554e8';
            vm.userContext = UserTypeContextEnum.STUDENT.enum;
            // vm.userContext = UserTypeContextEnum.EDUCATOR.enum;
            // vm.userContext = UserTypeContextEnum.ADMIN.enum;
            vm.openLessonNotesPopup = ZnkLessonNotesSrv.openLessonNotesPopup;


        });
})(angular);
