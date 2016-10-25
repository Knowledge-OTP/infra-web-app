(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ON_BOARDING.WELCOME": {
                            "WELCOME": "Welcome ",
                            "THANK_YOU_MESSAGE": "Thank you for joining us at ",
                            "WE_ARE_HERE_TO_HELP": "We'll show you how to earn your highest possible score!",
                            "CONTINUE": "CONTINUE"
                        },
                        "ON_BOARDING.GOALS": {
                            "SET_SCORE_GOALS": "Set Your Score Goals",
                            "WHATS_YOUR_DREAM_SCHOOL": "What is your dream school?",
                            "I_DONT_KNOW": "I don't know yet",
                            "SELECT_3_DREAM_SCHOOLS": "Select up to 3 dream schools"
                        },
                        "ON_BOARDING.DIAGNOSTIC": {
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "TAKE_IT_LATER": "Take it later",
                            "START_TEST": "START TEST",
                            "LETS_LEARN": "Let's learn a little about your mastery level in each subject.",
                            "THIS_QUICK_TEST": "This quick test will determine your initial estimated score and your training roadmap."
                        }
                    }
                );
            });
})(angular);
