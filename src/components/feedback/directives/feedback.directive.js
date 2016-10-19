(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').directive('feedback',
        function(feedbackSrv, $translatePartialLoader) {
            'ngInject';
            $translatePartialLoader.addPart('feedback');

            var directive = {
                restrict: 'E',
                template: '<button class="feedback-btn" ng-click="showDialog()"><svg-icon name="feedback-btn-icon"></svg-icon></button>',
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
