/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing').component('shViewer', {
        templateUrl: 'components/webAppScreenSharing/directives/shViewer/shViewerDirective.template.html',
        controller: function (CompleteExerciseSrv) {
            'ngInject';

            this.ceSettings = {
                mode: CompleteExerciseSrv.MODE_STATES.VIEWER
            };
        }
    });
})(angular);

