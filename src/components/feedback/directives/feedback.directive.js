(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').directive('feedback',
        function(feedbackSrv) {
            'ngInject';

            var directive = {
                restrict: 'E',
                template: '<button class="feedback-btn" ng-click="showDialog()"><span translate="FEEDBACK_POPUP.FEEDBACK"></span></button>',
                scope: {},
                link: function link(scope) {
                    scope.showDialog = function () {
                        feedbackSrv.showFeedbackDialog();
                    };
                }
            };
            return directive;
        });
})(angular);
