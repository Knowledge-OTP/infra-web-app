(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "SH_VIEWER": {
                            "STUDENT":{
                                "YOU_ARE_VIEWING": "Your are viewing your teacher's screen: ",
                                "NO_OPENED_EXERCISES": "Your teacher does not have any exercises open.",
                                "ONCE_OPEN": "Once your teacher opens an exercise, you will be able to view it here."
                            },
                            "DASHBOARD":{
                                "YOU_ARE_VIEWING": "Your are viewing your student's screen: ",
                                "NO_OPENED_EXERCISES": "Your student does not have any exercises open.",
                                "ONCE_OPEN": "Once your student opens an exercise, you will be able to view it here."
                            }
                        }
                    }
                );
            });
})(angular);
