(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing')
        .config(function (ScreenSharingUiSrvProvider) {
            'ngInject';

            ScreenSharingUiSrvProvider.setScreenSharingViewerTemplate('<sh-viewer></sh-viewer>');
        });
})(angular);
