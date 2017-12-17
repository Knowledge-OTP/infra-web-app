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
            vm.lessonSummary = { id: '5ad53c05-8a64-4694-6dfe-82a528bec33d' };
            // vm.userContext = UserTypeContextEnum.EDUCATOR.enum;
            vm.userContext = UserTypeContextEnum.ADMIN.enum;
            vm.openLessonNotesPopup = (lessonSummary, userContext) => {
                ZnkLessonNotesUiSrv.openLessonNotesPopup(lessonSummary, userContext);
            };
            vm.openLessonRatingPopup = (lessonSummary) => {
                ZnkLessonNotesUiSrv.openLessonRatingPopup(lessonSummary);
            };

        });
})(angular);
