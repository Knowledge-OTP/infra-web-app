(function () {
    var templateCacheName = 'raccoonIapMsg.template';

    angular.module('znk.infra-web-app.iapMsg')
        .run(function($templateCache){
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
        }
    )
    .service('raccoonIapMsgSrv',
        function ($compile, $rootScope, $animate, $document, $timeout, $templateCache, $sce) {
            'ngInject';

            var self = this;

            var raccoonTypes = {
                HINT_RACCOON: 'HINT',
                PRACTICE_RACCOON: 'PRACTICE_HINT'
            };
            this.raccoonTypes = raccoonTypes;

            var racccoonTypeToClassMap = {
                [this.raccoonTypes.HINT_RACCOON]: 'hint-raccoon',
                [this.raccoonTypes.PRACTICE_RACCOON]: 'hint-raccoon-for-practice'
            };

            function addPlaceHolderElement() {
                var wrapper = angular.element('<div class="raccoon-wrap"></div>');
                $document.find('body').append(wrapper);
                return wrapper;
            }

            var raccoonParentElm = addPlaceHolderElement();

            function _closeOnClickGlobalHandler() {
                $timeout(function () {
                    // self.closeRaccoonIapMsg();todo
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
        });
})(angular);
