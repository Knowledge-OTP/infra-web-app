(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "LOGIN_APP": {
                            "SAT_STUDENT_TAGLINE": "Welcome!<br/>Start prepping for the SAT® test with Zinkerz!",
                            "ACT_STUDENT_TAGLINE": "Welcome!<br/>Start prepping for the ACT® test with Zinkerz!",
                            "TOEFL_STUDENT_TAGLINE": "Welcome!<br/>Start prepping for the TOEFL® test with Zinkerz!",
                            "SAT_EDUCATOR_TAGLINE": "Welcome to the all-in-one<br/>SAT® desktop app for educators.",
                            "ACT_EDUCATOR_TAGLINE": "Welcome to the all-in-one<br/>ACT® desktop app for educators.",
                            "TOEFL_EDUCATOR_TAGLINE": "Welcome to the all-in-one<br/>TOEFL® desktop app for educators.",
                            "SIGN_UP_FOR_ZINKERZ_TEST_PREP": "Sign Up for Zinkerz Test Prep",
                            "CHECK_OUT_ZINKERZ_TOOLS_FOR_TEACHERS": "Check out Zinkerz tools for teachers",
                            "ARE_YOU_AN_EDUCATOR": "Are you an educator?",
                            "CHECK_OUT_OUR_APP_FOR_STUDENTS": "Check out our App for Students",
                            "FOR_EDUCATORS": "For Educators",
                            "EDUCATORS_CLICK_HERE": "Educators Click Here",
                            "SIGNUP_OR_LOGIN": "Please Sign Up or Log In to",
                            "ACCEPT_INVITATION": "Accept The Invitation",
                            "FORM_VALIDATION": {
                                "FIELD_IS_EMPTY": "Required field is empty",
                                "PASSWORD_TOO_SHORT": "Password is too short, must be between 6-25 characters",
                                "PASSWORD_TOO_LONG": "Password is too long, must be between 6-25 characters",
                                "EMAIL_TAKEN": "Email is already taken, please choose another"
                            }
                        },
                        "CHANGE_PASSOWRD_FORM": {
                            "BACK_TO_LOGIN": "Back to Login",
                            "RESET_PASSWORD": "Reset Password",
                            "SEND": "Send",
                            "NEW_PASSWORD_SENT": "A new password has been sent to your email address.",
                            "DONE": "Done",
                            "NO_SUCH_EMAIL": "We don’t recognize that email. Did you use another one to sign up?"
                        },
                        "LOGIN_FORM": {
                            "LOGIN": "Login",
                            "LOGIN_IN": "Log In",
                            "FORGOT_PWD": "Forgot password?",
                            "OR": "or",
                            "EMAIL": "Email",
                            "PASSWORD": "Password",
                            "STUDENT": {
                                "DONT_HAVE_AN_ACCOUNT": "Don't have a Zinkerz student account?",
                                "LOGIN": "Student Login"
                            },
                            "EDUCATOR": {
                                "DONT_HAVE_AN_ACCOUNT": "Don't have a Zinkerz educator account?",
                                "LOGIN": "Educator Login"
                            },
                            "ERROR_CODES": {
                                "INVALID_EMAIL": "The specified email is invalid.",
                                "INVALID_PASSWORD": "The specified password is incorrect.",
                                "INVALID_USER": "The specified user account does not exist.",
                                "DEFAULT_ERROR": "Error logging user in: "
                            }
                        },
                        "SIGNUP_FORM": {
                            "SIGNUP": "Signup",
                            "SIGN_UP": "Sign Up",
                            "OR": "or",
                            "NAME": "Name",
                            "EMAIL": "Email",
                            "PASSWORD": "Password",
                            "DISCLAIMER": "By signing up I agree to the <a href='{{termsOfUseHref}}' class='app-color'>Terms of Use</a> and <a href='{{privacyPolicyHref}}' class='app-color'>Privacy Policy</a>",
                            "STUDENT": {
                                "CREATE_ACCOUNT": "Create a Student Account",
                                "ALREADY_HAVE_ACCOUNT": "Already have a Zinkerz student account?"
                            },
                            "EDUCATOR": {
                                "CREATE_ACCOUNT": "Create an Educator Account",
                                "ALREADY_HAVE_ACCOUNT": "Already have a Zinkerz educator account?"
                            }
                        },
                        "OATH_SOCIAL": {
                            "CONNECT_WITH_FB": "Facebook",
                            "CONNECT_WITH_GOOGLE": "Google",
                            "ERROR_TITLE": "Connect With {{provider}} Failed",
                            "ERROR_CONTENT": "An error occurred while trying to connect with {{provider}}, please try again. If the problem persists please contact us at <a href='//www.zinkerz.com/contact/' target='_blank'>support@zinkerz.com</a>"
                        },
                        "PROMO_CODE":{
                            "GOT_A_PROMO_CODE":"Got a Promo Code?",
                            "GOT_A_ZINKERZ_EDUCATORS_PROMO_CODE": "Got a Zinkerz Educator Code?",
                            "ENTER_YOUR_CODE": "Enter your code...",
                            "ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED": "Zinkerz Educators Code Accepted",
                            "PROMO_CODE_ACCEPTED": "Promo code accepted",
                            "INVALID_CODE": "Invalid code, please contact support@zinkerz.com"
                        }
                    }
                );
            });
})(angular);
