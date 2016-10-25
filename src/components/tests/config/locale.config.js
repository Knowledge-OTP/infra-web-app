(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "NAVIGATION_PANE": {
                            "TEST": "Test {{testNumber}}",
                            "FULL_TEST_TITLE": "Full test",
                            "MINI_TEST_TITLE": "Mini test"
                        }
                    }
                );
            });
})(angular);
