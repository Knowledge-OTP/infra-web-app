(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "SCHOOL_SELECT": {
                            "SELECT_TO_CONTINUE": "Select up to 3 dream schools to continue",
                            "SCHOOLS": "Schools",
                            "REQUIRED_SCORE": "Required Score",
                            "SELECT_3_SCHOOLS": "Enter at least 3 letters to search for schools",
                            "NO_RESULTS": "No schools matched your search"
                        },
                        "USER_GOALS": {
                            "DREAM_SCHOOLS": "DREAM SCHOOLS",
                            "EDIT": "edit",
                            "CANCEL": "cancel",
                            "SAVE_AND_CONTINUE": "SAVE & CONTINUE",
                            "SAVE": "SAVE",
                            "SAVED": "SAVED",
                            "I_DONT_KNOW": "I don't know yet..."
                        }
                    }
                );
            });
})(angular);
