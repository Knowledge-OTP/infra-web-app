(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "TIMELINE_WEB_WRAPPER": {
                            "POINTS_LEFT": "{{points}} pts to go!"
                        }
                    }
                );
            });
})(angular);
