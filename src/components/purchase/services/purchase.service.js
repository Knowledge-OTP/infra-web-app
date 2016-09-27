(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        function ($rootScope, $state, $q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window, PopUpSrv, znkAnalyticsSrv, StorageSrv, AuthService) {
            'ngInject';

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();
            var pendingPurchaseDefer;
            var purchaseData = null;
            var authData = AuthService.getAuth();

            function getPurchasePath() {
                if (!authData) {
                    $log.error('Invalid user');
                    return;
                }
                var path = StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                return path.replace('$$uid', '' + authData.uid);
            }

            function getPendingPath() {
                if (!authData) {
                    $log.error('Invalid user');
                    return;
                }
                var path = 'pendingPurchases/' + StorageSrv.variables.uid;
                return path.replace('$$uid', '' + authData.uid);
            }

            var purchasePath = getPurchasePath();
            var pendingPurchasesPath = getPendingPath();

            self.checkUrlParams = function (params) {
                if (!angular.equals(params, {}) && params.purchaseSuccess) {
                    if (+params.purchaseSuccess === 1) {
                        self.setPendingPurchase();
                        znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderPending' });
                    } else {
                        znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderCancelled' });
                    }
                    self.showPurchaseDialog();
                } else {
                    self.checkPendingStatus();
                }
            };

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return $q.when(studentStorageProm).then(function (studentStorage) {
                    return studentStorage.get(productDataPath);
                });
            };

            self.hasProVersion = function () {
                var hasProVersion = !!purchaseData;
                return $q.when(hasProVersion);
            };

            self.getUpgradeData = function () {
                return $q.when(studentStorageProm).then(function (studentStorage) {
                    return studentStorage.get(purchasePath);
                });
            };

            self.purchaseDataExists = function () {
                if(purchasePath){
                    return $q.when(studentStorageProm).then(function (studentStorage) {
                        return studentStorage.get(purchasePath).then(function (purchaseObj) {
                            return !angular.equals(purchaseObj, {});
                        });
                    });
                } else {
                    return $q.reject();
                }
            };

            self.checkPendingStatus = function () {
                return $q.when(studentStorageProm).then(function (studentStorage) {
                    return studentStorage.get(pendingPurchasesPath).then(function (pendingObj) {
                        var isPending = !angular.equals(pendingObj, {});
                        if (isPending) {
                            pendingPurchaseDefer = $q.defer();
                        }
                        return isPending;
                    });
                });
            };

            self.setPendingPurchase = function () {
                pendingPurchaseDefer = $q.defer();
                return $q.all([self.getProduct(), self.purchaseDataExists(), studentStorageProm]).then(function (res) {
                    var product = res[0];
                    var isPurchased = res[1];
                    var studentStorage = res[2];

                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: StorageSrv.variables.currTimeStamp
                        };
                        studentStorage.set(pendingPurchasesPath, pendingPurchaseVal);
                    } else {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'purchaseOrderCompleted', props: product
                        });
                        if ($window.fbq) {
                            $window.fbq('track', 'Purchase', {
                                value: product.price,
                                currency: 'USD'
                            });
                        }
                    }
                }).catch(function (err) {
                    $log.error('setPendingPurchase promise failed', err);
                    pendingPurchaseDefer.reject(err);
                });
            };

            self.removePendingPurchase = function () {
                if (pendingPurchaseDefer) {
                    pendingPurchaseDefer.resolve();
                }
                $q.when(studentStorageProm).then(function (studentStorage) {
                    return studentStorage.set(pendingPurchasesPath, null);
                });
            };

            self.listenToPurchaseStatus = function () {
                var authData = AuthService.getAuth();
                if (authData) {
                    $q.when(studentStorageProm).then(function (studentStorage) {
                        var currentUID = authData.uid;
                        var purchaseFullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                        purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                        var ref = new Firebase(purchaseFullPath, ENV.firebaseAppScopeName);
                        ref.on('value', function (dataSnapshot) {
                            purchaseData = dataSnapshot.val();

                            studentStorage.cleanPathCache(purchasePath);

                            if ($state.current.name && $state.current.name !== '') {
                                $state.reload();
                            } else {
                                var removeListener = $rootScope.$on('$stateChangeSuccess', function () {
                                    removeListener();

                                    if ($state.current.name && $state.current.name !== '') {
                                        $state.reload();
                                    }
                                });
                            }

                            if (purchaseData) {
                                self.removePendingPurchase();
                            }
                        });
                    });

                }
            };

            self.showPurchaseDialog = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'purchaseModalOpened'
                });
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

                $q.when(studentStorageProm).then(function (studentStorage) {
                    studentStorage.set(path, productData).then(function (resp) {
                        $log.info(resp);
                    }).catch(function (err) {
                        $log.info(err);
                    });
                });
            };

            /**
             * @param mode:
             *  1 - completed first workout
             *  2 - completed all free content
             */
            self.openPurchaseNudge = function (mode, num) {
                var toastTemplate =
                    '<md-toast class="purchase-nudge" ng-class="{first: vm.mode === 1, all: vm.mode === 2}" translate-namespace="PURCHASE_POPUP">' +
                    '<div class="md-toast-text" flex>' +
                    '<div class="close-toast cursor-pointer" ng-click="vm.closeToast()"><svg-icon name="close-popup"></svg-icon></div>' +
                    '<span translate="{{vm.nudgeMessage}}" translate-values="{num: {{vm.num}} }"></span> ' +
                    '<span class="open-dialog" ng-click="vm.showPurchaseDialog()"><span translate="{{vm.nudgeAction}}"></span></span>' +
                    '</div>' +
                    '</md-toast>';

                $mdToast.show({
                    template: toastTemplate,
                    position: 'top',
                    hideDelay: false,
                    controller: function () {
                        self.closeToast = function () {
                            $mdToast.hide();
                        };

                        self.showPurchaseDialog = function () {
                            self.showPurchaseDialog();
                        };

                        if (mode === 1) { // completed first workout
                            self.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT';
                            self.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT';
                        } else if (mode === 2) { // completed all free content
                            self.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT';
                            self.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT';
                        }
                        self.mode = mode;
                        self.num = num;
                    },
                    controllerAs: 'vm'
                });
            };
        }
    );
})(angular);

