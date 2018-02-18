(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .controller('PurchaseDialogController',
            ["$mdDialog", "purchaseService", "PurchaseStateEnum", "ENV", "$scope", "$timeout", "PromoCodeSrv", "AuthService", "$filter", "PopUpSrv", function($mdDialog, purchaseService, PurchaseStateEnum, ENV, $scope, $timeout, PromoCodeSrv, AuthService, $filter, PopUpSrv) {
                'ngInject';

                var vm = this;
                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                vm.purchaseData = {};
                vm.purchaseStateEnum = PurchaseStateEnum;
                vm.appName = ENV.firebaseAppScopeName.split('_')[0].toUpperCase();
                vm.purchaseState = pendingPurchaseProm ? PurchaseStateEnum.PENDING.enum : PurchaseStateEnum.NONE.enum;
                vm.appId = {
                    id: ENV.firebaseAppScopeName
                };
                vm.studentContextConst = {
                    TEACHER: 1,
                    STUDENT: 2
                };
                vm.promoStatus = {
                    isApproved: false
                };

                vm.enablePromoCode = function (promoCodeId) {
                    var translate = $filter('translate');
                    AuthService.getAuth().then(authData => {
                        if (authData && authData.uid) {
                            if (angular.isDefined(promoCodeId)) {
                                var appContext = ENV.firebaseAppScopeName;
                                PromoCodeSrv.updatePromoCode(authData.uid, promoCodeId, appContext).then(function () {
                                    var successTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                                    var SuccessMsg = translate('PROMO_CODE.PROMO_CODE_SUCCESS_MESSAGE');
                                    PopUpSrv.success(successTitle, SuccessMsg).promise.then(function () {
                                        vm.close();
                                    });
                                }).catch(function () {
                                    var errorTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                                    var errorMsg = translate('PROMO_CODE.PROMO_CODE_ERROR_MESSAGE');
                                    PopUpSrv.error(errorTitle, errorMsg).promise.then(function () {
                                        vm.close();
                                    });
                                });
                            }
                        }
                    });
                };

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    vm.purchaseData = purchaseData;
                });

                $scope.$watch('vm.purchaseData', function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !(angular.equals(newPurchaseState, {}));
                        if (hasProVersion){
                            vm.purchaseState = PurchaseStateEnum.PRO.enum;
                        }
                    });
                }, true);

                purchaseService.getProduct().then(function (productPrice) {
                    vm.productPrice = +productPrice.price;
                    vm.productPreviousPrice = +productPrice.previousPrice;
                    vm.productDiscountPercentage = Math.floor(100 - ((vm.productPrice / vm.productPreviousPrice) * 100)) + '%';
                    // vm.promoCodeDiscountPercentage = '100%';
                });


                vm.close = function () {
                    $mdDialog.cancel();
                };
            }]);
})(angular);
