(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.user',
        'znk.infra.mailSender',
        'znk.infra.storage',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            'ngInject';
            var svgMap = {
                'close-popup': 'components/liveLessons/svg/close-popup.svg',
                'reschedule-icon': 'components/liveLessons/svg/reschedule-icon.svg',
                'calendar-icon': 'components/liveLessons/svg/calendar-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ])
        .run(function ($mdToast, MyLiveLessons) {
            'ngInject';
            MyLiveLessons.getClosestLiveLesson().then(function (closestLiveLessonObj) {
                if (angular.isUndefined(closestLiveLessonObj.startTime)) {
                    return;
                }

                var optionsOrPreset = {
                    templateUrl: 'components/liveLessons/templates/upcomingLessonToast.template.html',
                    hideDelay: false,
                    controller: 'UpcomingLessonToasterController',
                    controllerAs: 'vm',
                    locals: {
                        closestLiveLesson: closestLiveLessonObj
                    }
                };

                $mdToast.cancel().then(function () {
                    $mdToast.show(optionsOrPreset);
                });
            });
        });
})(window, angular);
