(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode', [])
        .config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'promo-code-arrow-icon': 'components/promoCode/svg/arrow-icon.svg',
                'promo-code-close-icon': 'components/promoCode/svg/close-icon.svg',
                'promo-code-correct-icon': 'components/promoCode/svg/correct-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').directive('promoCode',
        ["PromoCodeSrv", "PROMO_CODE_STATUS", function (PromoCodeSrv, PROMO_CODE_STATUS) {
            'ngInject';
            return {
                templateUrl: 'components/promoCode/directives/promoCode.template.html',
                restrict: 'E',
                scope: {
                    userContext: '<',
                    userContextConst: '<',
                    appContext: '<',
                    promoStatus: '='
                },
                link: function (scope) {
                    var ENTER_KEY_CODE = 13;
                    scope.d = {};
                    scope.d.promoCodeStatusConst = PROMO_CODE_STATUS;


                    scope.d.sendPromoCode = function (promoCode) {
                        if (promoCode) {
                            scope.d.showSpinner = true;
                            PromoCodeSrv.checkPromoCode(promoCode, scope.appContext.id).then(function (promoCodeResult) {
                                scope.d.promoCodeStatus = promoCodeResult.status;
                                scope.promoStatus = {
                                    isApproved: !promoCodeResult.status,
                                    promoKey: promoCode
                                };
                                scope.d.promoCodeStatusText = promoCodeResult.text;
                                scope.d.showSpinner = false;
                                if (scope.d.promoCodeStatus === scope.d.promoCodeStatusConst.accepted) {
                                    PromoCodeSrv.promoCodeToUpdate(promoCode);
                                } else {
                                    PromoCodeSrv.promoCodeToUpdate(undefined);
                                }
                            });
                        }
                    };
                    scope.d.clearInput = function () {
                        _cleanPromoCodeStatus();
                        scope.d.promoCode = '';
                    };

                    scope.$on('$destroy', function() {
                        PromoCodeSrv.cleanPromoCode();
                        scope.d.clearInput();
                    });

                    scope.d.keyDownHandler = function ($event, promoCode) {
                        if ($event.keyCode !== ENTER_KEY_CODE) {
                            _cleanPromoCodeStatus();
                            return;
                        }
                        scope.d.sendPromoCode(promoCode);
                    };

                    var promoCodeToUpdate = PromoCodeSrv.getPromoCodeToUpdate();  // restore promo code (if was entered) between login view and sign up view.
                    if (promoCodeToUpdate) {
                        scope.d.promoCode = promoCodeToUpdate;
                        scope.d.sendPromoCode(promoCodeToUpdate);
                    }

                    function _cleanPromoCodeStatus() {
                        scope.d.promoCodeStatus = -1;
                        scope.d.promoCodeStatusText = '';
                    }
                }
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode')
        .run(["$location", "PromoCodeSrv", "AuthService", "PopUpSrv", "$filter", "$injector", "$log", function ($location, PromoCodeSrv, AuthService, PopUpSrv, $filter, $injector, $log) {
            'ngInject';
            var appContext = '';

            try {
                $injector.invoke(['ENV', function (ENV) {
                    appContext = ENV.firebaseAppScopeName;

                }]);
            } catch (error) {
                $log.debug('ENV not injected');
            }

            var translate = $filter('translate');

            AuthService.getAuth().then(authData => {
                if (authData && authData.uid) {
                    var search = $location.search();
                    var promoCodeId = search.pcid;

                    delete search.pcid;

                    if (angular.isDefined(promoCodeId)) {
                        PromoCodeSrv.updatePromoCode(authData.uid, promoCodeId, appContext).then(function () {
                            var successTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                            var SuccessMsg = translate('PROMO_CODE.PROMO_CODE_SUCCESS_MESSAGE');
                            PopUpSrv.success(successTitle, SuccessMsg);
                        }).catch(function () {
                            var errorTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                            var errorMsg = translate('PROMO_CODE.PROMO_CODE_ERROR_MESSAGE');
                            PopUpSrv.error(errorTitle, errorMsg);
                        });
                    }
                }
            });
        }]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').constant('PROMO_CODE_STATUS', {
        accepted: 0,
        invalid: 1
    });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').provider('PromoCodeSrv',
        ["$injector", function ($injector) {
            var backendData = {};
            var _currentApp;

            try {
                $injector.invoke(['ENV', function (ENV) {
                    backendData = {};
                    _currentApp = ENV.firebaseAppScopeName;

                    backendData[_currentApp] = {  //default data
                        backendEndpoint: ENV.backendEndpoint,
                        currentAppName: ENV.firebaseAppScopeName,
                        studentAppName: ENV.studentAppName,
                        dashboardAppName: ENV.dashboardAppName,
                        serviceId: ENV.serviceId
                    };
                }]);
            } catch(error){

            }

            this.setBackendData = function (_backendData) {
                backendData = _backendData;
            };

            this.$get = ["PROMO_CODE_STATUS", "$translate", "$http", "PromoCodeTypeEnum", function (PROMO_CODE_STATUS, $translate, $http, PromoCodeTypeEnum) {
                'ngInject';

                var promoCodeSrv = {};

                var promoCodeStatus;
                var INVALID = 'PROMO_CODE.INVALID_CODE';
                var promoCodeToUpdate;

                var promoCodeStatusText = {};
                promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
                promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
                promoCodeStatusText[INVALID] = INVALID;

                promoCodeSrv.checkPromoCode = function (promoCode, currentApp) {
                    var backendEndpointUrl = backendData[currentApp].backendEndpoint;
                    var promoCodeCheckUrl = backendEndpointUrl + 'promoCode/check';

                    var dataToSend = {
                        serviceId: backendData[currentApp].serviceId,
                        promoCode: promoCode,
                        studentAppName: backendData[currentApp].studentAppName
                    };
                    return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                };

                promoCodeSrv.promoCodeToUpdate = function (promoCode) {
                    promoCodeToUpdate = promoCode;
                };

                promoCodeSrv.cleanPromoCode = function () {
                    promoCodeToUpdate = null;
                    promoCodeStatus = null;
                };

                promoCodeSrv.getPromoCodeToUpdate = function () {
                    return promoCodeToUpdate;
                };

                promoCodeSrv.updatePromoCode = function (uid, promoCode, currentApp) {
                    var backendEndpointUrl = backendData[currentApp].backendEndpoint;
                    var promoCodeUpdatekUrl = backendEndpointUrl + 'promoCode/update';

                    var dataToSend = {
                        currentAppName: backendData[currentApp].currentAppName,
                        studentAppName: backendData[currentApp].studentAppName,
                        dashboardAppName: backendData[currentApp].dashboardAppName,
                        uid: uid,
                        promoCode: promoCode,
                        serviceId: backendData[currentApp].serviceId
                    };
                    return $http.post(promoCodeUpdatekUrl, dataToSend);
                };

                function _validPromoCode(response) {
                    promoCodeStatus = {};
                    var promoCodeType = response.data;
                    if (response.data && promoCodeStatusText[promoCodeType]) {
                        promoCodeStatus.text = _getPromoCodeStatusText(response.data);
                        promoCodeStatus.status = PROMO_CODE_STATUS.accepted;
                    } else {
                        promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                        promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                    }
                    return promoCodeStatus;
                }

                function _invalidPromoCode() {
                    promoCodeStatus = {};
                    promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                    promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                    return promoCodeStatus;
                }

                function _getPromoCodeStatusText(translationKey) {
                    return $translate.instant(promoCodeStatusText[translationKey]);
                }

                return promoCodeSrv;
            }];
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').service('PromoCodeTypeEnum',['EnumSrv',
        function(EnumSrv) {

            var PromoCodeTypeEnum = new EnumSrv.BaseEnum([
                ['FREE_LICENSE', 1, 'free license'],
                ['ZINKERZ_EDUCATOR', 2, 'zinkerz educator'],
            ]);

            return PromoCodeTypeEnum;
        }]);
})(angular);

angular.module('znk.infra-web-app.promoCode').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/promoCode/directives/promoCode.template.html",
    "<div class=\"promo-code-wrapper\" translate-namespace=\"PROMO_CODE\"   ng-class=\"{\n" +
    "             'promo-code-accepted': d.promoCodeStatus === d.promoCodeStatusConst.accepted,\n" +
    "             'promo-code-invalid': d.promoCodeStatus === d.promoCodeStatusConst.invalid\n" +
    "             }\">\n" +
    "\n" +
    "    <div class=\"promo-code-title\"\n" +
    "         ng-if=\"!d.promoCodeStatusConst.accepted\"\n" +
    "         translate=\"{{(userContext === userContextConst.TEACHER ? '.GOT_A_ZINKERZ_EDUCATORS_PROMO_CODE' : '.GOT_A_PROMO_CODE') | translate}}\"\n" +
    "         ng-click=\"d.showPromoCodeOverlay = !d.showPromoCodeOverlay\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"promo-code-title accepted-title\">\n" +
    "        {{d.promoCodeStatusText}}\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"promo-code-overlay\" ng-if=\"d.showPromoCodeOverlay\">\n" +
    "\n" +
    "        <div class=\"promo-code-input-wrapper\">\n" +
    "            <div class=\"input-wrapper\"\n" +
    "               >\n" +
    "                <md-progress-circular ng-if=\"d.showSpinner\"\n" +
    "                                      class=\"promo-code-spinner\"\n" +
    "                                      md-mode=\"indeterminate\"\n" +
    "                                      md-diameter=\"25\">\n" +
    "                </md-progress-circular>\n" +
    "                <input\n" +
    "                    type=\"text\"\n" +
    "                    class=\"input-promo\"\n" +
    "                    ng-model=\"d.promoCode\"\n" +
    "                    ng-keydown=\"d.keyDownHandler($event, d.promoCode)\"\n" +
    "                    ng-autofocus =\"true\"\n" +
    "                    placeholder=\"{{'PROMO_CODE.ENTER_YOUR_CODE' | translate}}\">\n" +
    "                <div class=\"icon-wrapper\" >\n" +
    "                    <svg-icon class=\"arrow-icon\" name=\"promo-code-arrow-icon\" ng-click=\"d.sendPromoCode(d.promoCode)\"></svg-icon>\n" +
    "                    <svg-icon class=\"close-icon\" name=\"promo-code-close-icon\" ng-click=\"d.clearInput()\"></svg-icon>\n" +
    "                    <svg-icon class=\"correct-icon\" name=\"promo-code-correct-icon\"  ng-click=\"d.showPromoCodeOverlay = !d.showPromoCodeOverlay\"></svg-icon>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"promo-code-status-text\">\n" +
    "                    {{d.promoCodeStatusText}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/promoCode/svg/arrow-icon.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    version=\"1.1\" id=\"Capa_1\" x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"0 0 611.987 611.987\"\n" +
    "    xml:space=\"preserve\">\n" +
    "    <style>\n" +
    "        svg{\n" +
    "        width:30px;\n" +
    "        height:20px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g id=\"arrow-R\">\n" +
    "		<g>\n" +
    "			<path d=\"M604.652,287.018c-0.532-0.532-1.225-0.692-1.757-1.171L417.717,100.668c-10.329-10.329-27.074-10.329-37.377,0     c-10.328,10.329-10.328,27.074,0,37.376l141.334,141.333H26.622C11.926,279.377,0,291.304,0,306     c0,14.694,11.926,26.621,26.622,26.621h495.052L380.341,473.954c-10.329,10.329-10.329,27.074,0,37.376     c10.329,10.303,27.073,10.329,37.376,0l185.232-185.258c0.532-0.453,1.197-0.612,1.703-1.092c0.825-0.825,0.825-1.97,1.518-2.875     c2.263-2.796,3.86-5.856,4.818-9.158c0.346-1.277,0.586-2.396,0.719-3.7C612.799,301.34,610.749,293.087,604.652,287.018z\" fill=\"#FFFFFF\"/>\n" +
    "		</g>\n" +
    "	</g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/promoCode/svg/close-icon.svg",
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
  $templateCache.put("components/promoCode/svg/correct-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     class=\"correct-icon-svg\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 188.5 129\"\n" +
    "     style=\"enable-background:new 0 0 188.5 129;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.correct-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "        stroke: #231F20;\n" +
    "        stroke-width: 15;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"7.5\" y1=\"62\" x2=\"67\" y2=\"121.5\"/>\n" +
    "	<line class=\"st0\" x1=\"67\" y1=\"121.5\" x2=\"181\" y2=\"7.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
}]);
