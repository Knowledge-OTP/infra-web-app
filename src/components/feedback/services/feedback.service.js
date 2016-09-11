
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.feedback').service('feedbackSrv',

        function($mdDialog) {
            'ngInject';

            this.showFeedbackDialog = function () {
                $mdDialog.show({
                    controller: 'feedbackCtrl',
                    controllerAs: 'vm',
                    templateUrl: 'components/feedback/templates/feedback.template.html',
                    clickOutsideToClose: true
                });
            };
        }
    );
})(angular);

