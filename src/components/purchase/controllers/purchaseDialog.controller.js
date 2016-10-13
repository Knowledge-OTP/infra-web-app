(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .controller('PurchaseDialogController',
            ["$mdDialog", "purchaseService", "PurchaseStateEnum", "ENV", "$scope", "$timeout", function($mdDialog, purchaseService, PurchaseStateEnum, ENV, $scope, $timeout) {
                'ngInject';
                var vm = this;
                vm.purchaseData = {};

                vm.purchaseStateEnum = PurchaseStateEnum;
                vm.appName = ENV.firebaseAppScopeName.split('_')[0].toUpperCase();

                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                if (pendingPurchaseProm) {
                    self.purchaseState = PurchaseStateEnum.PENDING.enum;
                    self.subscriptionStatus = '.PROFILE_STATUS_PENDING';
                }

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    self.purchaseData = purchaseData;
                });

                $scope.$watch('self.purchaseData', function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !(angular.equals(newPurchaseState, {}));
                        self.purchaseState = (hasProVersion) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                        self.subscriptionStatus = (hasProVersion) ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                    });
                }, true);

                purchaseService.getProduct().then(function (productPrice) {
                    vm.productPrice = +productPrice.price;
                    vm.productPreviousPrice = +productPrice.previousPrice;
                    vm.productDiscountPercentage = Math.floor(100 - ((vm.productPrice / vm.productPreviousPrice) * 100)) + '%';
                });


                vm.close = function () {
                    $mdDialog.cancel();
                };
            }]);
})(angular);
