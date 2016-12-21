(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast', [
        'ngMaterial',
        'pascalprecht.translate',
        'ngSanitize',
        'znk.infra.svgIcon'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'znkToast-error-red-icon': 'components/znkToast/svg/znkToast-error-icon.svg',
                'znkToast-close-popup': 'components/znkToast/svg/znkToast-close-popup.svg',
                'znkToast-completed-v-icon': 'components/znkToast/svg/znkToast-completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast').controller('ToastController',
        ["$mdToast", "$sce", "type", "msg", function ($mdToast, $sce, type, msg) {
            'ngInject';

            var vm = this;
            vm.type = type;
            vm.msg = $sce.trustAsHtml(msg);

            vm.closeToast = function () {
                $mdToast.hide();
            };

        }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast')
        .service('ZnkToastSrv',
            ["$mdToast", function ($mdToast) {
                'ngInject';

                var self = this;

                self.showToast = function (type, msg, options) {
                    options = options || {};

                    $mdToast.show({
                        locals:{ type: type,  msg: msg },
                        templateUrl: 'components/znkToast/templates/znkToast.template.html',
                        position: options.position || 'top right',
                        hideDelay: angular.isDefined(options.hideDelay) ?  options.hideDelay : 3000,
                        controllerAs: 'vm',
                        controller: 'ToastController'
                    });
                };

                self.hideToast = function() {
                    $mdToast.hide();
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.znkToast').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkToast/svg/znkToast-close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkToast/svg/znkToast-completed-v.svg",
    "<svg\n" +
    "	xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "	y=\"0px\"\n" +
    "	viewBox=\"-1040 834.9 220.4 220.4\"\n" +
    "	style=\"enable-background:new -1040 834.9 220.4 220.4; width: 100%; height: auto;\"\n" +
    "    xml:space=\"preserve\"\n" +
    "    class=\"complete-v-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.complete-v-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st1 {\n" +
    "        fill: #CACBCC;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st2 {\n" +
    "        display: none;\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st3 {\n" +
    "        fill: #D1D2D2;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st4 {\n" +
    "        fill: none;\n" +
    "        stroke: #FFFFFF;\n" +
    "        stroke-width: 11.9321;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkToast/svg/znkToast-error-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"0 0 54.8 49.1\" class=\"error-icon-svg\">\n" +
    "\n" +
    "<style type=\"text/css\">\n" +
    "    .error-icon-svg {width: 100%; height: auto;}\n" +
    "    .error-icon-svg .st0{enable-background:new    ;}\n" +
    "</style>\n" +
    "\n" +
    "<path class=\"st0\" d=\"M54,39.8L32.8,3.1C30.4-1,24.4-1,22,3.1L0.8,39.8c-2.4,4.1,0.6,9.3,5.4,9.3h42.4C53.4,49.1,56.4,44,54,39.8z\n" +
    "	 M29.8,42.9c-0.7,0.6-1.5,0.9-2.4,0.9c-0.9,0-1.7-0.3-2.4-0.9s-1-1.4-1-2.5c0-0.9,0.3-1.7,1-2.4s1.5-1,2.4-1s1.8,0.3,2.4,1\n" +
    "	c0.7,0.7,1,1.5,1,2.4C30.8,41.4,30.5,42.2,29.8,42.9z M30.7,17.7l-1,11.2c-0.1,1.3-0.3,2.4-0.7,3.1c-0.3,0.7-0.9,1.1-1.7,1.1\n" +
    "	c-0.8,0-1.4-0.3-1.7-1c-0.3-0.7-0.5-1.7-0.7-3.1l-0.7-10.9C24,15.8,24,14.3,24,13.4c0-1.3,0.3-2.2,1-2.9s1.5-1.1,2.6-1.1\n" +
    "	c1.3,0,2.2,0.5,2.6,1.4c0.4,0.9,0.7,2.2,0.7,3.9C30.8,15.6,30.8,16.6,30.7,17.7z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkToast/templates/znkToast.template.html",
    "<md-toast ng-cloak\n" +
    "          ng-class=\"{'toast-wrap': vm.type === 'success',\n" +
    "                     'toast-wrap-progress': vm.type === 'progress',\n" +
    "                     'toast-wrap-error': vm.type === 'error'}\">\n" +
    "    <div class=\"icon-wrap\" ng-switch on=\"vm.type\">\n" +
    "        <svg-icon name=\"znkToast-completed-v-icon\" ng-switch-when=\"success\"></svg-icon>\n" +
    "        <svg-icon name=\"znkToast-error-red-icon\"ng-switch-when=\"error\"></svg-icon>\n" +
    "        <md-progress-circular class=\"progress-icon\" md-mode=\"indeterminate\" md-diameter=\"35\" ng-switch-when=\"progress\"></md-progress-circular>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"md-toast-content\">\n" +
    "        <div class=\"md-toast-text\" flex ng-bind-html=\"vm.msg | translate\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-button aria-label=\"close popup\"\n" +
    "        class=\"close-toast-wrap\" ng-click=\"vm.closeToast()\">\n" +
    "        <svg-icon name=\"znkToast-close-popup\"></svg-icon>\n" +
    "    </md-button>\n" +
    "\n" +
    "</md-toast>\n" +
    "");
}]);
