/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm', [
        '$translatePartialLoader', 'LoginAppSrv', '$timeout', '$translate', '$log',
        function ($translatePartialLoader, LoginAppSrv, $timeout, $translate, $log) {
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('loginApp');

                    scope.d = {};

                    var translateNamespace = 'SIGNUP_FORM';

                    function userContextString() {
                        var str;
                        if (scope.userContext === LoginAppSrv.USER_CONTEXT.STUDENT) {
                            str = 'student';
                        } else if (scope.userContext === LoginAppSrv.USER_CONTEXT.TEACHER) {
                            str = 'teacher';
                        }
                        return str.toUpperCase();
                    }

                    $translate([translateNamespace + '.' + userContextString() + '.CREATE_ACCOUNT'])
                        .then(function (translations) {
                            scope.d.createAccount = translations[translateNamespace + '.' + userContextString() + '.CREATE_ACCOUNT'];
                        })
                        .catch(function (translationIds) {
                            $log.error('failed to fetch the following translation ids: ', translationIds);
                        });

                    scope.signupSubmit = function(){
                        if (!scope.d.signupFormData) {
                            return;
                        }
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);

