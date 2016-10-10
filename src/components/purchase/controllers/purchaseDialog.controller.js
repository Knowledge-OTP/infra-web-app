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

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    vm.purchaseData = purchaseData;
                });

                purchaseService.getProduct().then(function (productPrice) {
                    vm.productPrice = +productPrice.price;
                    vm.productPreviousPrice = +productPrice.previousPrice;
                    vm.productDiscountPercentage = Math.floor(100 - ((vm.productPrice / vm.productPreviousPrice) * 100)) + '%';
                });

                $scope.$watch('vm.purchaseData', function (newPurchaseState) {
                    $timeout(function () {
                        vm.purchaseState = !angular.equals(newPurchaseState, {}) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                    });
                }, true);

                vm.close = function () {
                    $mdDialog.cancel();
                };
            }]);
})(angular);
