(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode', []).config([
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
                templateUrl: 'components/loginApp/templates/promoCode.template.html',
                restrict: 'E',
                scope: {},
                link: function (scope) {
                    var ENTER_KEY_CODE = 13;

                    scope.d = {};
                    scope.d.promoCodeStatusConst = PROMO_CODE_STATUS;


                    scope.d.sendPromoCode = function (promoCode) {
                        if (promoCode) {
                            scope.d.showSpinner = true;
                            PromoCodeSrv.checkPromoCode(promoCode).then(function (promoCodeResult) {
                                scope.d.promoCodeStatus = promoCodeResult.status;
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

    angular.module('znk.infra-web-app.promoCode').service('PromoCodeTypeEnum',['EnumSrv',
        function(EnumSrv) {

            var PromoCodeTypeEnum = new EnumSrv.BaseEnum([
                ['FREE_LICENSE', 1, 'free license'],
                ['ZINKERZ_EDUCATOR', 2, 'zinkerz educator'],
            ]);

            return PromoCodeTypeEnum;
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

    angular.module('znk.infra-web-app.promoCode').service('PromoCodeSrv',
        ["PROMO_CODE_STATUS", "$translate", "$http", "ENV", "PromoCodeTypeEnum", function (PROMO_CODE_STATUS, $translate, $http, ENV, PromoCodeTypeEnum) {
            'ngInject';

            var promoCodeStatus;
            var INVALID = 'PROMO_CODE.INVALID_CODE';
            var promoCodeCheckUrl = ENV.backendEndpoint + '/promoCode/check';
            var promoCodeToUpdate;

            var promoCodeStatusText = {};
            promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
            promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
            promoCodeStatusText[INVALID] = INVALID;

            this.checkPromoCode = function (promoCode) {
                var dataToSend = {
                    promoCode: promoCode,
                    appName: ENV.firebaseAppScopeName

                };

                return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
            };

            this.promoCodeToUpdate = function (promoCode) {
                promoCodeToUpdate = promoCode;
            };

            this.getPromoCodeToUpdate = function () {
                return promoCodeToUpdate;
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
        }]
    );
})(angular);

angular.module('znk.infra-web-app.promoCode').run(['$templateCache', function($templateCache) {
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
