(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "INVITE_APPROVE_MODAL":{
                            "YOU_HAVE_INVITE": "You have an invitation",
                            "WANT_TO_CONNECT": "would like to track your progress and view your completed work",
                            "DECLINE": "DECLINE",
                            "ACCEPT": "ACCEPT",
                            "SUCCESS_SEND_MSG": "You’ve successfully connected with your teacher.",
                            "DONE": "Done",
                            "INVITE_ERROR_TITLE": "Invalid Invitation",
                            "INVITE_ERROR_MSG": "The invitation you are trying to use is either invalid or expired. Please contact your educator to get a new invitation"
                        },

                        "INVITATION_MANAGER_DIRECTIVE": {
                            "EMPTY_INVITE":"Invite a teacher to track<br>your progress",
                            "INVITE_STUDENTS": "Invite a Teacher",
                            "PENDING_INVITATIONS": "Pending Invitations",
                            "PENDING_CONFORMATIONS": "Pending conformations",
                            "APPROVE_INVITE_ERROR":"We couldn't approve this invitation, please try again later.<br>If this persists please contact support@zinkerz.com",
                            "CANCEL_INVITE_ERROR": "The invitation couldn't be declined, please try again later.<br>If this persists please contact support@zinkerz.com",
                            "SUCCESS": "Success",
                            "SUCCESS_CONNECT": "You've successfully connected<br>with ",
                            "SUCCESS_DECLINE": "The invitation was declined",
                            "SUCCESS_DISCONNECT": "You've successfully disconnected from your teacher",
                            "DISCONNECT_ERROR": "We couldn't disconnected you from your teacher, please try again later.<br>If this persists please contact support@zinkerz.com",
                            "MY_TEACHER":"My Teacher",
                            "DECLINED_INVITATIONS": "DECLINED",
                            "DECLINED_YOR_INVITATION": "declined your invitation",
                            "DELETE_INVITATION": "Delete Invitation",
                            "ARE_U_SURE": "Are you sure?",
                            "YES": "Yes",
                            "NO": "No",
                            "DELETE_SUCCESS": "The invitation was successfully deleted",
                            "DELETE_ERROR": "We couldn't delete this invitation, please try again later.<br>If this persists please contact support@zinkerz.com"
                        },

                        "INVITE_TEACHER_MODAL": {
                            "INVITE_TEACHER": "Invite a Teacher",
                            "TEACHER_EMAIL": "Your teacher's email",
                            "TEACHER_NAME": "Your teacher's name",
                            "REQUIRED": "This field is required",
                            "INVITE": "Invite",
                            "INVITE_MSG": "Your teacher will receive an email invitation.",
                            "SUCCESS_INVITE": "You've successfully invited your teacher.",
                            "DONE": "Done",
                            "GENERAL_ERROR" : "An error has occurred, Please try again later"
                        }
                    }

                );
            });
})(angular);
