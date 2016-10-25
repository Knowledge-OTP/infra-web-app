(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ZNK_HEADER": {
                            "WORKOUTS": "workouts",
                            "TESTS": "tests",
                            "TUTORIALS": "tips&Tricks",
                            "PERFORMANCE": "performance",
                            "ETUTORING": "Live Lessons",
                            "PROFILE_STATUS_BASIC": "Get Zinkerz Pro",
                            "PROFILE_STATUS_PENDING": "Processing payment...",
                            "PROFILE_STATUS_PRO": "Zinkerz Pro",
                            "PROFILE_GOALS": "my goals",
                            "PROFILE_CHANGE_PASSWORD": "change password",
                            "PROFILE_SUPPORT": "support",
                            "PROFILE_LOGOUT": "log out"
                        }
                    }
                );
            });
})(angular);
