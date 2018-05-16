(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .component('purchaseBtn', {
            bindings: {
                purchaseState: '='
            },
            templateUrl: 'components/purchase/components/purchaseBtn/purchaseBtn.template.html',
            controllerAs: 'vm',
            controller: function ($scope, ENV, $q, $sce, AuthService, $location, purchaseService, $timeout,
                                  $filter, PurchaseStateEnum, $log, znkAnalyticsSrv, StripeService) {
                'ngInject';

                var vm = this;
                vm.translate = $filter('translate');

                $scope.$watch(function () {
                    return vm.purchaseState;
                }, function (newPurchaseState) {
                    if (angular.isUndefined(newPurchaseState)) {
                        return;
                    }


                    if (newPurchaseState === PurchaseStateEnum.PRO.enum) {
                        $q.when(purchaseService.getPurchaseData()).then(function (purchaseData) {
                            if (!angular.equals(purchaseData, {})) {
                                vm.upgradeDate = $filter('date')(purchaseData.creationTime, 'mediumDate');
                            }
                        });
                    }
                });

                vm.purchaseZinkerzPro = function () {
                    purchaseService.hidePurchaseDialog();
                    $timeout(() => vm.purchaseState = PurchaseStateEnum.PENDING.enum);
                    znkAnalyticsSrv.eventTrack({eventName: 'purchaseOrderStarted'});
                    purchaseService.getProduct().then(product => {
                        $log.debug(`purchaseZinkerzPro: productId: ${product.id}, price: ${product.price}`);
                        const name = vm.translate('PURCHASE_POPUP.UPGRADE_TO_ZINKERZ_PRO');
                        const description = vm.translate('PURCHASE_POPUP.DESCRIPTION');
                        StripeService.openStripeModal(ENV.serviceId, product.id, product.price, name, description)
                            .then(stripeRes => {
                                if (!stripeRes.closedByUser) {
                                    purchaseService.setPendingPurchase();
                                    $log.debug(`purchaseZinkerzPro: User update to pending purchase`);
                                    // The stripe web hook should update the firebase
                                    // and the getAndBindToServer should trigger the event to change purchaseState to pro
                                    purchaseService.showPurchaseDialog();
                                } else {
                                    $log.debug(`purchaseCredits: stripe modal closed by user`);
                                    $timeout(() => vm.purchaseState = PurchaseStateEnum.NONE.enum);
                                }
                            });
                    });

                };

                vm.showPurchaseError = function () {
                    purchaseService.hidePurchaseDialog().then(function () {
                        purchaseService.showPurchaseError();
                    });
                };

            }
        });
})(angular);
