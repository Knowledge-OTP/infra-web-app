(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('ActStorageSrv', ['$q', function($q){
        var mock = {};

        mock.variables = {
            uid:12,
            appUserSpacePath: 'mockPath',
            currTimeStamp:332
        };

        mock.get = function(){
            return $q.when('mock path');
        };

        mock.cleanPathCache = function (){
            return;
        };

        mock.set = function (){
            return;
        };
        return mock;
    }]);

    angular.module('znk.infra-web-app.purchase').service('purchaseService', [
        '$q', '$mdDialog' , '$filter', 'ActStorageSrv', 'AuthService', 'ENV', '$log', '$mdToast', '$window',
        function ($q, $mdDialog, $filter, ActStorageSrv, AuthService, ENV, $log, $mdToast, $window) {

            var self = this;

            var pendingPurchaseDefer;

            var purchaseData = null;

            var pendingPurchasesPath = 'pendingPurchases/' + ActStorageSrv.variables.uid;

            var PURCHASE_PATH = ActStorageSrv.variables.appUserSpacePath + '/' + 'purchase';

            this.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return ActStorageSrv.get(productDataPath);
            };

            this.getUpgradeData = function () {
                return ActStorageSrv.get(PURCHASE_PATH);
            };

            this.hasProVersion = function () {
                var hasProVersion = !!purchaseData;
                return $q.when(hasProVersion);
            };

            this.purchaseDataExists = function () {
                var isPurchased;
                var authData = AuthService.getAuth();
                if (authData) {
                    var currentUID = authData.uid;
                    var purchaseFullPath = ActStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                    purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                    return ActStorageSrv.get(purchaseFullPath).then(function (purchaseObj) {
                        isPurchased = (angular.equals(purchaseObj, {})) ? false : true;
                        return isPurchased;
                    });
                }
                return $q.reject();
            };

            this.checkPendingStatus = function () {
                var isPending;
                return ActStorageSrv.get(pendingPurchasesPath).then(function (pendingObj) {
                    isPending = (angular.equals(pendingObj, {})) ? false : true;
                    if (isPending) {
                        pendingPurchaseDefer = $q.defer();
                    }
                    return isPending;
                });
            };

            this.setPendingPurchase = function () {
                pendingPurchaseDefer = $q.defer();
                return $q.all([self.getProduct(), self.purchaseDataExists()]).then(function (res) {
                    var product = res[0];
                    var isPurchased = res[1];
                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: ActStorageSrv.variables.currTimeStamp
                        };
                        ActStorageSrv.set(pendingPurchasesPath, pendingPurchaseVal);
                    } else {
                        //znkAnalyticsSrv.eventTrack({
                        //    eventName: 'purchaseOrderCompleted', props: product
                        //});
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

            this.removePendingPurchase = function () {
                if (pendingPurchaseDefer) {
                    pendingPurchaseDefer.resolve();
                }
                return ActStorageSrv.set(pendingPurchasesPath, null);
            };

            this.listenToPurchaseStatus = function () {
                var authData = AuthService.getAuth();
                if (authData) {
                    var currentUID = authData.uid;
                    var purchaseFullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + ActStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                    purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                    var ref = new Firebase(purchaseFullPath);
                    ref.on('value', function (dataSnapshot) {
                        var dataSnapshotVal = dataSnapshot.val();

                        //if (angular.isDefined(dataSnapshotVal)) {
                        //    if ($state.current.name && $state.current.name !== '') {
                        //        $state.reload();
                        //    }
                        //}

                        purchaseData = dataSnapshotVal;

                        ActStorageSrv.cleanPathCache(PURCHASE_PATH);
                        if (purchaseData) {
                            self.removePendingPurchase();
                        }
                    });
                }
            };

            this.showPurchaseDialog = function () {
                //a.eventTrack({
                //    eventName: 'purchaseModalOpened'
                //});
                return $mdDialog.show({
                    controller: 'PurchaseDialogController',
                    templateUrl: 'components/purchase/templates/purchasePopup.template.html',
                    disableParentScroll: false,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    controllerAs: 'vm'
                });
            };

            this.hidePurchaseDialog = function () {
                return $mdDialog.hide();
            };

            this.showPurchaseError = function () {
                var popUpTitle = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_TITLE');
                var popUpContent = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_CONTENT');
                PopUpSrv.error(popUpTitle, popUpContent);
            };

            this.getPendingPurchase = function () {
                return pendingPurchaseDefer && pendingPurchaseDefer.promise;
            };

            this.setProductDataOnce = function () {
                var path = 'iap/desktop/allContent';
                var productData = {
                    alias: 'allContent',
                    id: 'com.zinkerz.act.allcontent',
                    type: 'non consumable',
                    price: '39.99',
                    previousPrice: '44.99'
                };
                ActStorageSrv.set(path, productData).then(function (resp) {
                    $log.info(resp);
                }).catch(function (err) {
                    $log.info(err);
                });
            };

            /**
             * @param mode:
             *  1 - completed first workout
             *  2 - completed all free content
             */
            this.openPurchaseNudge = function (mode, num) {
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
                        this.closeToast = function () {
                            $mdToast.hide();
                        };

                        this.showPurchaseDialog = function () {
                            self.showPurchaseDialog();
                        };

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
            };
        }
        ]);
})(angular);

