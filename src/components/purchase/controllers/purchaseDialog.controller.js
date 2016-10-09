(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .controller('PurchaseDialogController',
        function($mdDialog, purchaseService, PurchaseStateEnum, ENV) {
            'ngInject';
            var vm = this;

            vm.purchaseStateEnum = PurchaseStateEnum;
            vm.appName = ENV.firebaseAppScopeName.split('_')[0].toUpperCase();

            purchaseService.getPurchaseState().then(function (state) {
                vm.purchaseState = state;
            });

            purchaseService.getProduct().then(function (productPrice) {
                vm.productPrice = +productPrice.price;
                vm.productPreviousPrice = +productPrice.previousPrice;
                vm.productDiscountPercentage = Math.floor(100 - ((vm.productPrice / vm.productPreviousPrice) * 100)) + '%';
            });

            vm.close = function () {
                $mdDialog.cancel();
            };
        });
})(angular);
