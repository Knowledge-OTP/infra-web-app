(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('promoCodeInput',
        function (PromoCodeSrv, PROMO_CODE_STATUS) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/promoCodeInput.template.html',
                restrict: 'E',
                scope: {},
                link: function (scope) {
                    var ENTER_KEY_CODE = 13;
                    
                    scope.d = {};
                    scope.d.promoCodeStatusConst = PROMO_CODE_STATUS;

                    scope.d.clickHandler = function (promoCode) {
                        if(promoCode){
                            PromoCodeSrv.checkPromoCode(promoCode).then(function(promoCodeResult){
                                var status = scope.d.promoCodeStatus = promoCodeResult.promoCodeStatus;
                                var type = promoCodeResult.promoCodeType;
                                scope.d.promoCodeStatusText = PromoCodeSrv.getPromoCodeStatusText(status, type);
                            });
                        }
                    };

                    scope.d.keyDownHandler= function($event, promoCode) {
                        if ($event.keyCode !== ENTER_KEY_CODE) {
                            scope.d.promoCodeStatus = -1;
                            scope.d.promoCodeStatusText = '';
                            return;
                        }
                        scope.d.clickHandler(promoCode);
                    }
                }
            };
        }
    );
})(angular);
