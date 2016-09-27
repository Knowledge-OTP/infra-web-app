(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        function ($q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window, PopUpSrv, znkAnalyticsSrv, StorageSrv, AuthService) {
            'ngInject';

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();

            var pendingPurchaseDefer;

            var purchaseData = null;

            var PURCHASE_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'purchase';

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return $q.when(studentStorageProm).then(function (StorageSrv) {
                    return StorageSrv.get(productDataPath);
                });
            };

            self.getUpgradeData = function () {
                $q.when(studentStorageProm).then(function (StorageSrv) {
                    var PURCHASE_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                    console.log('StorageSrv.variables.appUserSpacePath ', StorageSrv.variables.appUserSpacePath );
                    console.log('PURCHASE_PATH ', PURCHASE_PATH );
                    return PURCHASE_PATH ? StorageSrv.get(PURCHASE_PATH) : {};
                });
            };

            self.hasProVersion = function () {
                var hasProVersion = !!purchaseData;
                return $q.when(hasProVersion);
            };

            self.purchaseDataExists = function () {
                var isPurchased;
                var authData = AuthService.getAuth();
                if (authData) {
                   var currentUID = authData.uid;
                   var purchaseFullPath = StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                   purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                   return StorageSrv.get(purchaseFullPath).then(function (purchaseObj) {
                       isPurchased = (angular.equals(purchaseObj, {})) ? false : true;
                       return isPurchased;
                   });
                }
                return $q.reject();
            };

            self.checkPendingStatus = function () {
                var isPending;
                return $q.when(studentStorageProm).then(function (StorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StorageSrv.variables.uid;

                    return StorageSrv.get(pendingPurchasesPath).then(function (pendingObj) {
                        isPending = (angular.equals(pendingObj, {})) ? false : true;
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
                    var StorageSrv = res[2];
                    var pendingPurchasesPath = 'pendingPurchases/' + StorageSrv.variables.uid;

                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: StorageSrv.variables.currTimeStamp
                        };
                        StorageSrv.set(pendingPurchasesPath, pendingPurchaseVal);
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
                $q.when(studentStorageProm).then(function (StorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StorageSrv.variables.uid;
                    return StorageSrv.set(pendingPurchasesPath, null);
                });
            };

            self.listenToPurchaseStatus = function () {
               var authData = AuthService.getAuth();
               if (authData) {
                   var currentUID = authData.uid;
                   var purchaseFullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                   purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                   var ref = new Firebase(purchaseFullPath);
                   ref.on('value', function (dataSnapshot) {
                       var dataSnapshotVal = dataSnapshot.val();

                       // if (angular.isDefined(dataSnapshotVal)) {
                       //    if ($state.current.name && $state.current.name !== '') {
                       //        $state.reload();
                       //    }
                       // }

                       purchaseData = dataSnapshotVal;

                       StorageSrv.cleanPathCache(PURCHASE_PATH);
                       if (purchaseData) {
                           self.removePendingPurchase();
                       }
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

                $q.when(studentStorageProm).then(function (StorageSrv) {
                    StorageSrv.set(path, productData).then(function (resp) {
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

