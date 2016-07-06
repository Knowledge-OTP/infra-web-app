(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg',[
        'ngSanitize',
        'znk.infra.svgIcon',
        'ngAnimate'
    ])
        .config(["SvgIconSrvProvider", function(SvgIconSrvProvider){
            'ngInject'; 

            var svgMap = {
                'iap-msg-close-msg': 'components/iapMsg/svg/close-msg.svg',
                'iap-msg-hint-bubble': 'components/iapMsg/svg/hint-bubble.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg').service('IapMsgSrv',
        ["raccoonIapMsgSrv", function (raccoonIapMsgSrv) {
            'ngInject';

            this.raccoonTypes = raccoonIapMsgSrv.raccoonTypes;

            this.showRaccoonIapMsg = function(msg,type){
                raccoonIapMsgSrv.showRaccoonIapMsg (msg,type);
                return raccoonIapMsgSrv.closeRaccoonIapMsg;
            };
        }]
    );
})(angular);

(function () {
    'use strict';
    
    var templateCacheName = 'raccoonIapMsg.template';

    angular.module('znk.infra-web-app.iapMsg')
        .run(["$templateCache", function($templateCache){
            'ngInject';

            var template =
                '<div class="raccoon-in-app show-hide-animation" ng-class="raccoonTypeClass">' +
                    '<div class="svg-wrap">' +
                        '<svg-icon name="iap-msg-close-msg" ng-click="close()"></svg-icon>' +
                    '</div>' +
                    '<div class="bubble-wrap">' +
                        '<div class="msg-wrap">' +
                            '<div class="msg" ng-bind-html="message"></div>' +
                            '<svg-icon name="iap-msg-hint-bubble" class="hint-bubble-svg"></svg-icon>' +
                        '</div>' +
                    '</div>' +
                    '<div class="raccoon">' +
                        '<div></div>' +
                    '</div>' +
                '</div>';
            $templateCache.put(templateCacheName,template);
        }]
    )
    .service('raccoonIapMsgSrv',
        ["$compile", "$rootScope", "$animate", "$document", "$timeout", "$templateCache", "$sce", function ($compile, $rootScope, $animate, $document, $timeout, $templateCache, $sce) {
            'ngInject';

            var self = this;

            var raccoonTypes = {
                HINT_RACCOON: 'HINT',
                PRACTICE_RACCOON: 'PRACTICE_HINT'
            };
            this.raccoonTypes = raccoonTypes;

            var racccoonTypeToClassMap = {};
            racccoonTypeToClassMap[this.raccoonTypes.HINT_RACCOON] = 'hint-raccoon';
            racccoonTypeToClassMap[this.raccoonTypes.PRACTICE_RACCOON] = 'hint-raccoon-for-practice';

            function addPlaceHolderElement() {
                var wrapper = angular.element('<div class="raccoon-wrap"></div>');
                $document.find('body').append(wrapper);
                return wrapper;
            }

            var raccoonParentElm = addPlaceHolderElement();

            function _closeOnClickGlobalHandler() {
                $timeout(function () {
                    self.closeRaccoonIapMsg();
                });
            }

            function _addCloseOnGlobalClickHandler() {
                $document[0].body.addEventListener('click', _closeOnClickGlobalHandler);
            }

            function _removeCloseOnGlobalClickHandler() {
                $document[0].body.removeEventListener('click', _closeOnClickGlobalHandler);
            }

            function _getRaccoonClass(raccoonType) {
                return racccoonTypeToClassMap[raccoonType];
            }

            var scope;
            /**** DO NOT USE THIS SERVICE, use IapMsgSrv instead!!!!!! ****/
            this.closeRaccoonIapMsg = function () {
                _removeCloseOnGlobalClickHandler();

                $animate.leave(raccoonParentElm.children());

                if (scope) {
                    scope.$destroy();
                    scope = null;
                }
            };
            /**** DO NOT USE THIS SERVICE, use IapMsgSrv instead!!!!!! ****/
            this.showRaccoonIapMsg = function (message, raccoonType) {
                if (scope) {
                    self.closeRaccoonIapMsg();
                }

                scope = $rootScope.$new(true);
                scope.close = this.closeRaccoonIapMsg;
                $sce.trustAsHtml(message);
                scope.message = message;
                scope.raccoonTypeClass = _getRaccoonClass(raccoonType);

                var template = $templateCache.get(templateCacheName);
                var raccoonElm = angular.element(template);
                raccoonParentElm.append(raccoonElm);
                $animate.enter(raccoonElm, raccoonParentElm, null).then(function(){
                    _addCloseOnGlobalClickHandler();
                });
                $compile(raccoonElm)(scope);
            };
        }]);
})(angular);

angular.module('znk.infra-web-app.iapMsg').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/iapMsg/svg/close-msg.svg",
    "<svg class=\"iap-msg-close-msg-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-596.6 492.3 133.2 133.5\">\n" +
    "    <style>\n" +
    "        .iap-msg-close-msg-svg{\n" +
    "            width: 12px;\n" +
    "        }\n" +
    "\n" +
    "        .iap-msg-close-msg-svg line {\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 10px;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/iapMsg/svg/hint-bubble.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 2006.4 737.2\"\n" +
    "     class=\"iap-msg-hint-bubble-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .iap-msg-hint-bubble-svg{\n" +
    "            width: 400px;\n" +
    "        }\n" +
    "\n" +
    "        .iap-msg-hint-bubble-svg .st0 {\n" +
    "            fill: #FFFFFF;\n" +
    "            stroke: #8A8484;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M2003.9,348.5c0-191.1-448-346-1000.7-346S2.5,157.4,2.5,348.5s448,346,1000.7,346\n" +
    "	c163.9,0,318.6-13.6,455.2-37.8c26.1,18.2,69.5,38.4,153,61.7c83.6,23.3,154.7,14.8,154.7,14.8s-87.6-50.2-134.5-115.4\n" +
    "	C1858.7,554.4,2003.9,457.3,2003.9,348.5z\"/>\n" +
    "</svg>\n" +
    "");
}]);
