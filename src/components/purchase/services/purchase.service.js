/*jshint -W117 */
/*jshint unused:false*/

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        function ($rootScope, $state, $q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window,
                  PopUpSrv, StorageSrv, AuthService) {
            'ngInject';

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();
            var pendingPurchaseDefer;

            self.setPage = function (pageName) {
                ga('set', 'page', `/${pageName}.html`);
            };

            self.sendPage = function () {
                ga('send', 'pageview');
            };

            self.updatePage = function (pageName) {
                self.setPage(pageName);
                self.sendPage();
            };
            /**
             * sendEvent
             * @param eventCategory - Typically the object that was interacted with (e.g. 'Video')
             * @param eventAction - The type of interaction (e.g. 'play')
             */
            self.sendEvent = function (eventCategory, eventAction) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: eventCategory,
                    eventAction: eventAction,
                    eventLabel: 'Toefl Campaign'
                });
            };
            self.getMarketingToefl = function () {
                var marketingPath = StorageSrv.variables.appUserSpacePath + `/marketing`;
                return InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    return studentStorage.get(marketingPath).then(function (marketing) {
                        return marketing;
                    });
                });
            };
            self.getPath = function (param) {
                return AuthService.getAuth().then(authData => {
                    if (!authData) {
                        $log.error('Invalid user');
                        return;
                    }
                    var path;
                    switch (param) {
                        case 'purchase':
                            path = StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                            return path.replace('$$uid', '' + authData.uid);
                        case 'pending':
                            path = 'pendingPurchases/' + StorageSrv.variables.uid;
                            return path.replace('$$uid', '' + authData.uid);
                        default:
                            return;
                    }
                });
            };

            self.checkUrlParams = function (params) {
                if (!angular.equals(params, {}) && params.purchaseSuccess) {
                    if (+params.purchaseSuccess === 1) {
                        self.setPendingPurchase();
                      //  znkAnalyticsSrv.eventTrack({eventName: 'purchaseOrderPending'});
                    } else {
                       // znkAnalyticsSrv.eventTrack({eventName: 'purchaseOrderCancelled'});
                    }
                    self.showPurchaseDialog();
                } else {
                }
            };

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return studentStorageProm.then(function (studentStorage) {
                    return studentStorage.get(productDataPath);
                });
            };

            self.hasProVersion = function () {
                return self.getPurchaseData().then(function (purchaseData) {
                    return !angular.equals(purchaseData, {});
                });
            };

            self.getPurchaseData = function () {
                return self.getPath('purchase').then(purchasePath => {
                    if (purchasePath) {
                        return studentStorageProm.then(function (studentStorage) {
                            return studentStorage.getAndBindToServer(purchasePath);
                        });
                    } else {
                        return null;
                    }
                });
            };

            self.checkPendingStatus = function () {
                return studentStorageProm.then(function (studentStorage) {
                    return self.getPath('pending').then(pendingPurchasesPath => {
                        return studentStorage.get(pendingPurchasesPath).then(function (pendingObj) {
                            var isPending = !angular.equals(pendingObj, {});
                            if (isPending) {
                                pendingPurchaseDefer = $q.defer();
                            }
                            return isPending;
                        });
                    });
                });
            };

            self.setPendingPurchase = function () {
                pendingPurchaseDefer = $q.defer();
            };

            self.removePendingPurchase = function () {
                if (pendingPurchaseDefer) {
                    pendingPurchaseDefer.resolve();
                }
                studentStorageProm.then(function (studentStorage) {
                    return self.getPath('pending').then(pendingPurchasesPath => {
                        return studentStorage.set(pendingPurchasesPath, null);
                    });
                });
            };

            self.listenToPurchaseStatus = function () {
                self.hasProVersion().then(function (hasPro) {
                    if (hasPro) {
                        self.removePendingPurchase();
                    }
                });
            };

            self.showPurchaseDialog = function () {
                // znkAnalyticsSrv.eventTrack({
                //     eventName: 'purchaseModalOpened'
                // });
                return $mdDialog.show({
                    controller: 'PurchaseDialogController',
                    templateUrl: 'components/purchase/templates/purchasePopup.template.html',
                    disableParentScroll: false,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    controllerAs: 'vm'
                });
            };

            self.hidePurchaseDialog = function () {
                return $mdDialog.hide();
            };

            self.showPurchaseError = function () {
                var popUpTitle = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_TITLE');
                var popUpContent = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_CONTENT');
                PopUpSrv.error(popUpTitle, popUpContent);
            };

            self.getPendingPurchase = function () {
                return pendingPurchaseDefer && pendingPurchaseDefer.promise;
            };

            self.setProductDataOnce = function () {
                var path = 'iap/desktop/allContent';
                var productData = {
                    alias: 'allContent',
                    id: 'com.zinkerz.act.allcontent',
                    type: 'non consumable',
                    price: '39.99',
                    previousPrice: '44.99'
                };

                studentStorageProm.then(function (studentStorage) {
                    studentStorage.set(path, productData).then(function (resp) {
                        $log.debug(resp);
                    }).catch(function (err) {
                        $log.debug(err);
                    });
                });
            };

            /**
             * @param mode:
             *  1 - completed first workout
             *  2 - completed all free content
             */
            self.openPurchaseNudge = function (mode, num) {
                if (true) {
                    return;  // todo - temporary removed because the style is broken
                } else {
                    var toastTemplate =
                        '<md-toast class="purchase-nudge" ng-class="{first: vm.mode === 1, all: vm.mode === 2}" translate-namespace="PURCHASE_POPUP">' +
                        '<div class="md-toast-text" flex>' +
                        '<div class="close-toast cursor-pointer" ng-click="vm.closeToast()"><svg-icon name="purchase-close-popup"></svg-icon></div>' +
                        '<span translate="{{vm.nudgeMessage}}" translate-values="{num: {{vm.num}} }"></span> ' +
                        '<span class="open-dialog" ng-click="vm.showPurchaseDialog()"><span translate="{{vm.nudgeAction}}"></span></span>' +
                        '</div>' +
                        '</md-toast>';

                    $mdToast.show({
                        template: toastTemplate,
                        position: 'top',
                        hideDelay: false,
                        controller: function () {
                            this.num = num;
                            this.node = mode;
                            this.closeToast = function () {
                                $mdToast.hide();
                            };

                            this.showPurchaseDialog = self.showPurchaseDialog; // todo - check if it's working

                            if (mode === 1) { // completed first workout
                                this.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT';
                                this.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT';
                            } else if (mode === 2) { // completed all free content
                                this.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT';
                                this.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT';
                            }
                            this.mode = mode;
                            this.num = num;
                        },
                        controllerAs: 'vm'
                    });
                }

            };
        }
    );
})(angular);

