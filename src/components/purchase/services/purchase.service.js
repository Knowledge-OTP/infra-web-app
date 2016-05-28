(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        function ($q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window, PopUpSrv, znkAnalyticsSrv) {
            'ngInject';

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();

            var pendingPurchaseDefer;

            var purchaseData = null;

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    return StudentStorageSrv.get(productDataPath);
                });
            };

            self.getUpgradeData = function () {
                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var PURCHASE_PATH = StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                    return StudentStorageSrv.get(PURCHASE_PATH);
                });
            };

            self.hasProVersion = function () {
                var hasProVersion = !!purchaseData;
                return $q.when(hasProVersion);
            };

            self.purchaseDataExists = function () {
                //var isPurchased;
                //var authData = AuthService.getAuth();
                //if (authData) {
                //    var currentUID = authData.uid;
                //    var purchaseFullPath = StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                //    purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                //    return StudentStorageSrv.get(purchaseFullPath).then(function (purchaseObj) {
                //        isPurchased = (angular.equals(purchaseObj, {})) ? false : true;
                //        return isPurchased;
                //    });
                //}
                //return $q.reject();
            };

            self.checkPendingStatus = function () {
                var isPending;
                return $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;

                    return StudentStorageSrv.get(pendingPurchasesPath).then(function (pendingObj) {
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
                    var StudentStorageSrv = res[2];
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;

                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: StudentStorageSrv.variables.currTimeStamp
                        };
                        StudentStorageSrv.set(pendingPurchasesPath, pendingPurchaseVal);
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
                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;
                    return StudentStorageSrv.set(pendingPurchasesPath, null);
                });
            };
            //
            //self.listenToPurchaseStatus = function () {
            //    var authData = AuthService.getAuth();
            //    if (authData) {
            //        var currentUID = authData.uid;
            //        var purchaseFullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
            //        purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
            //        var ref = new Firebase(purchaseFullPath);
            //        ref.on('value', function (dataSnapshot) {
            //            var dataSnapshotVal = dataSnapshot.val();
            //
            //            //if (angular.isDefined(dataSnapshotVal)) {
            //            //    if ($state.current.name && $state.current.name !== '') {
            //            //        $state.reload();
            //            //    }
            //            //}
            //
            //            purchaseData = dataSnapshotVal;
            //
            //            StudentStorageSrv.cleanPathCache(PURCHASE_PATH);
            //            if (purchaseData) {
            //                self.removePendingPurchase();
            //            }
            //        });
            //    }
            //};

            self.showPurchaseDialog = function () {
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

                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    StudentStorageSrv.set(path, productData).then(function (resp) {
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

