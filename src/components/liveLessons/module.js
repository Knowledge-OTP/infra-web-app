(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.user',
        'znk.infra.storage',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {};
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
