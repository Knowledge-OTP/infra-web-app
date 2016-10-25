(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "SETTING": {
                            "CHANGE_PASSWORD": "Change Password",
                            "SAVE": "Save",
                            "OLD_PASSWORD": "Old Password",
                            "NEW_PASSWORD": "New Password",
                            "CONFIRM_NEW_PASSWORD": "Confirm New Password",
                            "REQUIRED_FIELD":"This is required.",
                            "PASSWORD_LENGTH": "Password length must be between 6 to 25 characters.",
                            "PASSWORD_NOT_MATCH": "New Password doesn't match.",
                            "ERROR_OCCURRED": "An error has occurred, Please try again.",
                            "SAVE_SUCCESS": "Your new password has been successfully saved.",
                            "INCORRECT_PASSWORD":"Incorrect password.",
                            "NO_INTERNET_CONNECTION_ERR": "No internet connection. Please try again later.",
                            "DONE": "Done"
                        }
                    }
                );
            });
})(angular);
