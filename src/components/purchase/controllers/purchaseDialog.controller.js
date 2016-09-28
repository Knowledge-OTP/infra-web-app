(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .controller('PurchaseDialogController',
        function($mdDialog, purchaseService, PurchaseStateEnum) {
            'ngInject';
            var self = this;

            self.purchaseStateEnum = PurchaseStateEnum;
            purchaseService.getPurchaseState().then(function (state) {
                self.purchaseState = state;
            });

            purchaseService.getProduct().then(function (prodObj) {
                self.productPrice = +prodObj.price;
                self.productPreviousPrice = +prodObj.previousPrice;
                self.productDiscountPercentage = Math.floor(100 - ((self.productPrice / self.productPreviousPrice) * 100)) + '%';
            });

            this.close = function () {
                $mdDialog.cancel();
            };
        });
})(angular);
