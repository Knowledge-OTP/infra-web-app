(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        [
            'ngAnimate',
            'ui.router',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics',
            'znk.infra-web-app.stripe'
        ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .component('purchaseBtn', {
            bindings: {
                purchaseState: '='
            },
            templateUrl: 'components/purchase/components/purchaseBtn/purchaseBtn.template.html',
            controllerAs: 'vm',
            controller: ["$scope", "ENV", "$q", "$sce", "AuthService", "$location", "purchaseService", "$timeout", "$filter", "PurchaseStateEnum", "$log", "StripeService", function ($scope, ENV, $q, $sce, AuthService, $location, purchaseService, $timeout,
                                  $filter, PurchaseStateEnum, $log, StripeService) {
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
                   // znkAnalyticsSrv.eventTrack({eventName: 'purchaseOrderStarted'});
                    purchaseService.getMarketingToefl().then(function (marketingObj) {
                        if (marketingObj && marketingObj.status) {
                            purchaseService.sendEvent('diagnostic', 'click-upgrade');
                        }
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
                    });
                };

                vm.showPurchaseError = function () {
                    purchaseService.hidePurchaseDialog().then(function () {
                        purchaseService.showPurchaseError();
                    });
                };

            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .config(
            ["SvgIconSrvProvider", function (SvgIconSrvProvider) {
                'ngInject';
                var svgMap = {
                    'purchase-check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'purchase-close-popup': 'components/purchase/svg/purchase-close-popup.svg',
                    'sheet-icon': 'components/purchase/svg/sheet-icon.svg',
                    'note-and-pencil': 'components/purchase/svg/note-and-pencil.svg',
                    'question-mark-square': 'components/purchase/svg/question-mark-square.svg',
                    'grail-icon': 'components/purchase/svg/grail-icon.svg',
                    'open-lock-icon': 'components/purchase/svg/open-lock-icon.svg',
                    'purchase-raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .controller('PurchaseDialogController',
            ["$mdDialog", "purchaseService", "PurchaseStateEnum", "ENV", "$scope", "$timeout", "PromoCodeSrv", "AuthService", "$filter", "PopUpSrv", function($mdDialog, purchaseService, PurchaseStateEnum, ENV, $scope, $timeout, PromoCodeSrv, AuthService, $filter, PopUpSrv) {
                'ngInject';

                var vm = this;
                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                vm.purchaseData = {};
                vm.purchaseStateEnum = PurchaseStateEnum;
                vm.appName = ENV.firebaseAppScopeName.split('_')[0].toUpperCase();
                vm.purchaseState = pendingPurchaseProm ? PurchaseStateEnum.PENDING.enum : PurchaseStateEnum.NONE.enum;
                vm.appId = {
                    id: ENV.firebaseAppScopeName
                };
                vm.studentContextConst = {
                    TEACHER: 1,
                    STUDENT: 2
                };
                vm.promoStatus = {
                    isApproved: false
                };

                vm.enablePromoCode = function (promoCodeId) {
                    var translate = $filter('translate');
                    AuthService.getAuth().then(authData => {
                        if (authData && authData.uid) {
                            if (angular.isDefined(promoCodeId)) {
                                var appContext = ENV.firebaseAppScopeName;
                                PromoCodeSrv.updatePromoCode(authData.uid, promoCodeId, appContext).then(function () {
                                    var successTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                                    var SuccessMsg = translate('PROMO_CODE.PROMO_CODE_SUCCESS_MESSAGE');
                                    PopUpSrv.success(successTitle, SuccessMsg).promise.then(function () {
                                        vm.close();
                                    });
                                }).catch(function () {
                                    var errorTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                                    var errorMsg = translate('PROMO_CODE.PROMO_CODE_ERROR_MESSAGE');
                                    PopUpSrv.error(errorTitle, errorMsg).promise.then(function () {
                                        vm.close();
                                    });
                                });
                            }
                        }
                    });
                };

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    vm.purchaseData = purchaseData;
                });

                $scope.$watch('vm.purchaseData', function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !(angular.equals(newPurchaseState, {}));
                        if (hasProVersion){
                            vm.purchaseState = PurchaseStateEnum.PRO.enum;
                        }
                    });
                }, true);

                purchaseService.getProduct().then(function (productPrice) {
                    vm.productPrice = +productPrice.price;
                    vm.productPreviousPrice = +productPrice.previousPrice;
                    vm.productDiscountPercentage = Math.floor(100 - ((vm.productPrice / vm.productPreviousPrice) * 100)) + '%';
                    // vm.promoCodeDiscountPercentage = '100%';
                });


                vm.close = function () {
                    $mdDialog.cancel();
                };
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('PurchaseStateEnum',['EnumSrv',
        function(EnumSrv) {

            var PurchaseStateEnum = new EnumSrv.BaseEnum([
                ['PENDING', 'pending', 'pending'],
                ['PRO', 'pro', 'pro'],
                ['NONE', 'none', 'none']
            ]);

            return PurchaseStateEnum;
        }]);
})(angular);

(function(){
    'use strict';

    angular.module('znk.infra-web-app.purchase').run(
        // execute in APP load, to check if the student have zinkerz pro
        ["$log", "ENV", "purchaseService", function($log, ENV, purchaseService){
            'ngInject';

            $log.debug('Check Purchase State');
            const isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';

            if (!isTeacherApp) {
                purchaseService.checkPendingStatus();

                // run FB listener through bingToServer to detect whether the user has upgraded to PRO,
                // if true, remove the pending purchase from FB
                purchaseService.listenToPurchaseStatus();
            }

        }]
    );
})();

/*jshint -W117 */
/*jshint unused:false*/

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        ["$rootScope", "$state", "$q", "$mdDialog", "$filter", "InfraConfigSrv", "ENV", "$log", "$mdToast", "$window", "PopUpSrv", "StorageSrv", "AuthService", function ($rootScope, $state, $q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window,
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
        }]
    );
})(angular);


angular.module('znk.infra-web-app.purchase').run(['$templateCache', function ($templateCache) {
  $templateCache.put("components/purchase/components/purchaseBtn/purchaseBtn.template.html",
    "<ng-switch on=\"vm.purchaseState\">\n" +
    "\n" +
    "    <div ng-switch-when=\"pending\">\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"pending\">\n" +
    "                    <md-progress-circular md-mode=\"indeterminate\" md-diameter=\"45\"></md-progress-circular>\n" +
    "                    <span class=\"text\" translate=\".UPGRADE_PENDING\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"pro\">\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"icon-wrapper completed\">\n" +
    "                    <svg-icon name=\"purchase-check-mark\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span class=\"text\" translate=\".UPGRADED_ON\" translate-values=\"{upgradeDate: vm.upgradeDate}\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"none\">\n" +
    "        <div class=\"upgrade-btn-wrapper\">\n" +
    "            <button class=\"md-button success drop-shadow inline-block\"\n" +
    "                    ng-click=\"vm.purchaseZinkerzPro()\"\n" +
    "                    translate=\".UPGRADE_NOW\"\n" +
    "                    name=\"submit\">\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</ng-switch>\n" +
    "");
  $templateCache.put("components/purchase/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"purchase-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .purchase-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/grail-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 208.1 203\" class=\"purchase-popup-bullet-4-icon\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .purchase-popup-bullet-4-icon .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h74c0,0-8.8,65.7-14.7,82.9c-5.3,15.6-13,32.6-36.7,43.2c-12.3,5.5-10.3,21.7-10.3,31.5\n" +
    "		c0,11.2,5.4,16.7,13.3,20.4c3.7,1.7,8.3,3.2,14.3,4v15h-40\"/>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h-74c0,0,8.8,65.7,14.7,82.9c5.3,15.6,13,32.6,36.7,43.2c12.3,5.5,10.3,21.7,10.3,31.5\n" +
    "		c0,11.2-5.4,16.7-13.3,20.4c-3.7,1.7-8.3,3.2-14.3,4v15h40\"/>\n" +
    "    </g>\n" +
    "    <path class=\"st1\" d=\"M176.8,20.4c0,0,71.3-1.5-12.2,67.5\"/>\n" +
    "    <path class=\"st1\" d=\"M31.3,20.4c0,0-71.3-1.5,12.2,67.5\"/>\n" +
    "    <polygon class=\"st1\" points=\"102.6,22 113.1,43.4 136.6,46.8 119.6,63.4 123.6,86.9 102.6,75.8 81.5,86.9 85.5,63.4 68.5,46.8\n" +
    "	92,43.4 \"/>\n" +
    "    <line class=\"st2\" x1=\"66.6\" y1=\"193.9\" x2=\"143.6\" y2=\"193.9\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/note-and-pencil.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 124 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-2-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-2-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M77.7,139H16.8c-4.5,0-8.3-3.7-8.3-8.3V10.3c0-4.5,3.7-8.3,8.3-8.3h60.9c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C85.9,135.3,82.2,139,77.7,139z\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"21.2\" x2=\"17\" y2=\"21.2\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"40.9\" x2=\"17\" y2=\"40.9\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"60.6\" x2=\"17\" y2=\"60.6\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"80.4\" x2=\"17\" y2=\"80.4\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"100.1\" x2=\"17\" y2=\"100.1\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"119.8\" x2=\"17\" y2=\"119.8\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M122,2v116l-7.3,21l-8.7-20.1V24.5V7.2c0,0,1-5.2,6.6-5.2S122,2,122,2z\"/>\n" +
    "		<line class=\"st2\" x1=\"106\" y1=\"21.7\" x2=\"122\" y2=\"21.7\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/open-lock-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 148.7 174.7\"\n" +
    "    style=\"enable-background:new 0 0 148.7 174.7;\"\n" +
    "    class=\"purchase-popup-bullet-5-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-5-icon .st0{fill:none;stroke:#231F20;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-5-icon .st1{fill:none;stroke:#231F20;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M93.4,171.7H12.6c-5.3,0-9.6-4.3-9.6-9.6V81.3c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,167.4,98.7,171.7,93.4,171.7z\"/>\n" +
    "	<path class=\"st0\" d=\"M78.7,71.7V39.9C78.7,19.6,93.8,3,112.2,3h0c18.4,0,33.5,16.6,33.5,36.9v31.9\"/>\n" +
    "	<path class=\"st1\" d=\"M53.2,101c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,106.1,47.1,101,53.2,101\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/previous-icon.svg",
    "<svg class=\"previous-icon\" x=\"0px\" y=\"0px\" viewBox=\"-406.9 425.5 190.9 175.7\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/question-mark-square.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-3-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-3-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st1\" d=\"M39.6,54.6c4.4-5.7,11.7-9.2,19.7-8.2c9.7,1.2,17.4,9.1,18.4,18.7c1.2,11-5.9,20.6-15.9,23.1\n" +
    "			c-3.1,0.8-5.3,3.7-5.3,6.9v8.6\"/>\n" +
    "		<circle cx=\"56.5\" cy=\"116.7\" r=\"2.8\"/>\n" +
    "	</g>\n" +
    "	<line class=\"st2\" x1=\"32.7\" y1=\"34.2\" x2=\"25.7\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"84.8\" y1=\"34.2\" x2=\"91.8\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"59.3\" y1=\"29.5\" x2=\"59.3\" y2=\"18.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/sheet-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    class=\"purchase-popup-bullet-1-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-1-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "	C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"26.5\" x2=\"96\" y2=\"26.5\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"44.7\" x2=\"70.5\" y2=\"44.7\"/>\n" +
    "<line class=\"st0\" x1=\"48.5\" y1=\"62.9\" x2=\"96\" y2=\"62.9\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"81.1\" x2=\"96\" y2=\"81.1\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"99.3\" x2=\"59.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"72.2\" y1=\"99.3\" x2=\"94.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"22\" y1=\"117.5\" x2=\"95.5\" y2=\"117.5\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchasePopup.template.html",
    "<md-dialog class=\"purchase-popup base-border-radius\" aria-label=\"Get Zinkerz\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "    <div class=\"purchase-popup-container\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"raccoon\">\n" +
    "                <svg-icon name=\"purchase-raccoon-logo-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"close-popup-wrap\">\n" +
    "                <svg-icon name=\"purchase-close-popup\" ng-click=\"vm.close()\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <h2>\n" +
    "                    <span translate=\".GET_ZINKERZ\"></span>\n" +
    "                    <span class=\"pill pro\" translate=\".PRO\"></span>\n" +
    "                </h2>\n" +
    "                <p translate=\".DESCRIPTION\"></p>\n" +
    "                <div>\n" +
    "                    <promo-code ng-show=\"vm.purchaseState === vm.purchaseStateEnum.NONE.enum\" user-context-const=\"vm.studentContextConst\" promo-status=\"vm.promoStatus\"\n" +
    "                        user-context=\"vm.studentContextConst.STUDENT\" app-context=\"vm.appId\"></promo-code>\n" +
    "                </div>\n" +
    "                <div class=\"price\" ng-show=\"!vm.promoStatus.isApproved && vm.purchaseState === vm.purchaseStateEnum.NONE.enum\">\n" +
    "                    <del>{{'$' + vm.productPreviousPrice}}</del>\n" +
    "                    <b>{{'$' + vm.productPrice}}</b>\n" +
    "                    <span translate=\".SAVE\" translate-values='{ percent: vm.productDiscountPercentage}'></span>\n" +
    "                </div>\n" +
    "                <div class=\"price\" ng-show=\"vm.promoStatus.isApproved\">\n" +
    "                    <del>{{'$' + vm.productPreviousPrice}}</del>\n" +
    "                    <b>$0</b>\n" +
    "                    <span translate=\".SAVE\" translate-values='{ percent: vm.promoCodeDiscountPercentage}'></span>\n" +
    "                </div>\n" +
    "                <div class=\"action\">\n" +
    "                    <purchase-btn purchase-state=\"vm.purchaseState\" ng-if=\"!vm.promoStatus.isApproved\"></purchase-btn>\n" +
    "                    <button class=\"upgrade-btn-wrapper md-button success action\" ng-if=\"vm.promoStatus.isApproved\"\n" +
    "                            ng-click=\"vm.enablePromoCode(vm.promoStatus.promoKey)\"\n" +
    "                        translate=\".UPGRADE_NOW\" name=\"submit\">\n" +
    "                    </button>\n" +
    "                </div>\n" +
    "                <div class=\"features-box base-border-radius\">\n" +
    "                    <ul>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon class=\"feature-svg\" name=\"{{'PURCHASE_POPUP.BULLET1ICON' | translate}}\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET1\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon class=\"feature-svg\" name=\"{{'PURCHASE_POPUP.BULLET2ICON' | translate}}\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET2\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon class=\"feature-svg\" name=\"{{'PURCHASE_POPUP.BULLET3ICON' | translate}}\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET3\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon class=\"feature-svg\" name=\"{{'PURCHASE_POPUP.BULLET4ICON' | translate}}\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET4\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon class=\"feature-svg\" name=\"{{'PURCHASE_POPUP.BULLET5ICON' | translate}}\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET5\"></span>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);
