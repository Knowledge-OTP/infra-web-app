(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing', [
        'znk.infra.screenSharing',
        'znk.infra-web-app.completeExercise'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing')
        .config(["ScreenSharingUiSrvProvider", function (ScreenSharingUiSrvProvider) {
            'ngInject';

            ScreenSharingUiSrvProvider.setScreenSharingViewerTemplate('<sh-viewer></sh-viewer>');
        }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing').component('shViewer', {
        templateUrl: 'components/webAppScreenSharing/directives/shViewer/shViewerDirective.template.html',
        require: {
            screenSharing: '^screenSharing'
        },
        controller: ["CompleteExerciseSrv", "ENV", "ScreenSharingSrv", function (CompleteExerciseSrv, ENV, ScreenSharingSrv) {
            'ngInject';

            var $ctrl = this;

            function _shDataChangeHandler(newShData) {
                $ctrl.activeScreen = newShData.activeExercise && newShData.activeExercise.activeScreen;
            }

            function _registerToShDataChanges() {
                ScreenSharingSrv.registerToActiveScreenSharingDataChanges(_shDataChangeHandler);
            }

            function _unregisterFromShDataChanges() {
                ScreenSharingSrv.unregisterFromActiveScreenSharingDataChanges(_shDataChangeHandler);
            }

            this.$onInit = function () {
                _registerToShDataChanges();
                this.appContext = ENV.appContext.toUpperCase();

                this.ceSettings = {
                    mode: CompleteExerciseSrv.MODE_STATES.VIEWER,
                    exitAction: $ctrl.screenSharing.onClose
                };
            };

            this.$onDestroy = function () {
                _unregisterFromShDataChanges();
            };

        }]
    });
})(angular);


angular.module('znk.infra-web-app.webAppScreenSharing').run(['$templateCache', function ($templateCache) {
  $templateCache.put("components/webAppScreenSharing/directives/shViewer/shViewerDirective.template.html",
    "<div translate-namespace=\"SH_VIEWER.{{$ctrl.appContext}}\">\n" +
    "    <div class=\"header\">\n" +
    "            <span class=\"you-are-viewing-text\"\n" +
    "                  translate=\".YOU_ARE_VIEWING\">\n" +
    "            </span>\n" +
    "    </div>\n" +
    "    <ng-switch on=\"!!$ctrl.activeScreen\" class=\"sh-viewer-main-container\">\n" +
    "        <div ng-switch-when=\"false\" class=\"none\">\n" +
    "            <div class=\"exit-btn\"\n" +
    "                 ng-click=\"$ctrl.ceSettings.exitAction()\"\n" +
    "                 translate=\".EXIT\">\n" +
    "            </div>\n" +
    "            <div class=\"texts-container\">\n" +
    "                <div class=\"text1\"\n" +
    "                     translate=\".NO_OPENED_EXERCISES\">\n" +
    "                </div>\n" +
    "                <div class=\"text2\"\n" +
    "                     translate=\".ONCE_OPEN\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-default>\n" +
    "            <complete-exercise settings=\"$ctrl.ceSettings\">\n" +
    "            </complete-exercise>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
}]);
