(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function($translateProvider){
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/i18n/{part}/{lang}.json'
            });
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm', [
        'pascalprecht.translate',
        'znk.infra.svgIcon'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'login-form-envelope': 'components/loginForm/svg/login-form-envelope.svg',
                'login-form-lock': 'components/loginForm/svg/login-form-lock.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        ['ngAnimate',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'check-mark': 'components/purchase/svg/check-mark-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        ['ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra-web-app.purchase'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg',
                    'purchase-popup-bullet-1-icon': 'components/znkHeader/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/znkHeader/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/znkHeader/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/znkHeader/svg/purchase-popup-bullet-4-icon.svg',
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('InfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var InfraConfigSrv = {};

                    return InfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').directive('loginForm', [
        '$translatePartialLoader', 'LoginFormSrv',
        function ($translatePartialLoader, LoginFormSrv) {
            return {
                templateUrl: 'components/loginForm/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginForm');

                    scope.vm = {};

                    scope.vm.submit = function(){
                        LoginFormSrv.login(scope.vm.formData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').service('LoginFormSrv', [
        'ENV', '$http', '$window',
        function (ENV, $http, $window) {
            this.login = function(loginData){
                var ref = new Firebase(ENV.fbGlobalEndPoint);
                return ref.authWithPassword(loginData).then(function(authData){
                    var postUrl = ENV.backendEndpoint + 'firebase/token';
                    var postData = {
                        email: authData.password ? authData.password.email : '',
                        uid: authData.uid,
                        fbDataEndPoint: ENV.fbDataEndPoint,
                        fbEndpoint: ENV.fbGlobalEndPoint,
                        auth: ENV.dataAuthSecret,
                        token: authData.token
                    };

                    return $http.post(postUrl, postData).then(function (token) {
                        var refDataDB = new Firebase(ENV.fbDataEndPoint);
                        refDataDB.authWithCustomToken(token.data).then(function(){
                            var appUrl = ENV.redirectLogin;
                            $window.location.replace(appUrl);
                        });
                    });
                });
            };
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.loginForm').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginForm/svg/login-form-envelope.svg",
    "<svg\n" +
    "    class=\"login-form-envelope-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 190.2 143.7\">\n" +
    "    <style>\n" +
    "        .login-form-envelope-svg{\n" +
    "            width: 20px;\n" +
    "            stroke: #CACACA;\n" +
    "            fill: none;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M174.7,141.2H15.4c-7.1,0-12.9-5.8-12.9-12.9V15.4c0-7.1,5.8-12.9,12.9-12.9h159.3c7.1,0,12.9,5.8,12.9,12.9\n" +
    "		v112.8C187.7,135.3,181.9,141.2,174.7,141.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M4.1,7.3l77.3,75.1c7.6,7.4,19.8,7.4,27.4,0l77.3-75.1\"/>\n" +
    "	<line class=\"st0\" x1=\"77\" y1=\"78\" x2=\"7.7\" y2=\"135.5\"/>\n" +
    "	<line class=\"st0\" x1=\"112.8\" y1=\"78\" x2=\"182.1\" y2=\"135.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/svg/login-form-lock.svg",
    "<svg class=\"locked-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .locked-svg{\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/templates/loginForm.directive.html",
    "<ng-form novalidate class=\"login-form-container\" translate-namespace=\"LOGIN_FORM\" ng-submit=\"vm.submit()\">\n" +
    "    <div class=\"title\"\n" +
    "         translate=\".LOGIN\">\n" +
    "    </div>\n" +
    "    <div class=\"inputs-container\">\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                   name=\"email\"\n" +
    "                   ng-model=\"vm.formData.email\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-lock\"></svg-icon>\n" +
    "            <input type=\"password\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                   name=\"password\"\n" +
    "                   ng-model=\"vm.formData.password\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"submit-btn-wrapper\">\n" +
    "        <button type=\"submit\" translate=\".LOGIN_IN\"></button>\n" +
    "    </div>\n" +
    "    <div class=\"forgot-pwd-wrapper\">\n" +
    "        <span translate=\".FORGOT_PWD\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth-title\" translate=\".CONNECT_WITH\"></div>\n" +
    "    </div>\n" +
    "</ng-form>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').controller('PurchaseDialogController',['$mdDialog', 'purchaseService','PurchaseStateEnum',
        function($mdDialog, purchaseService, PurchaseStateEnum) {

            var self = this;

            self.purchaseStateEnum = PurchaseStateEnum;

            function _checkIfHasProVersion() {
                purchaseService.hasProVersion().then(function (hasProVersion) {
                    self.purchaseState = hasProVersion ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                });
            }

            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                pendingPurchaseProm.then(function () {
                    _checkIfHasProVersion();
                });
            } else {
                _checkIfHasProVersion();
            }



            purchaseService.getProduct().then(function (prodObj) {
                self.productPrice = +prodObj.price;
                self.productPreviousPrice = +prodObj.previousPrice;
                self.productDiscountPercentage = Math.floor(100 - ((self.productPrice / self.productPreviousPrice) * 100)) + '%';
            });

            this.close = function () {
                $mdDialog.hide();
            };
        }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').directive('purchaseBtn', [
        'ENV', '$q', '$sce', 'AuthService', 'UserProfileService', '$location', 'purchaseService', '$filter', 'PurchaseStateEnum', '$log', '$translatePartialLoader',
        function (ENV, $q, $sce, AuthService, UserProfileService, $location, purchaseService, $filter, PurchaseStateEnum, $log, $translatePartialLoader) {
            return {
                templateUrl:  'components/purchase/templates/purchaseBtn.template.html',
                restrict: 'E',
                scope: {
                    purchaseState: '='
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('purchase');

                    scope.vm = {};

                    scope.vm.translate = $filter('translate');

                    //scope.vm.saveAnalytics = function () {
                    //    znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderStarted' });
                    //};

                    scope.$watch('purchaseState', function (newPurchaseState) {
                        if (angular.isUndefined(newPurchaseState)) {
                            return;
                        }

                        if (newPurchaseState === PurchaseStateEnum.NONE.enum) {
                            buildForm();
                        }

                        if (newPurchaseState === PurchaseStateEnum.PRO.enum) {
                            purchaseService.getUpgradeData().then(function (resp) {
                                /**
                                 * TODO: currently the createdTime doesn't exist in this object, need to add to firebase
                                 */
                                scope.vm.upgradeDate = $filter('date')(resp.creationTime, 'mediumDate');
                            });
                        }
                    });

                    function buildForm() {
                        $q.all([UserProfileService.getProfile(), purchaseService.getProduct()]).then(function (results) {
                            var userEmail = results[0].email;
                            var userId = AuthService.getAuth().uid;
                            var productId = results[1].id;

                            if (userEmail && userId) {
                                scope.vm.userEmail = userEmail;
                                scope.vm.hostedButtonId = ENV.purchasePaypalParams.hostedButtonId;
                                scope.vm.custom = userId + '#' + productId + '#' + ENV.fbDataEndPoint + '#' + ENV.firebaseAppScopeName;  // userId#productId#dataEndPoint#appName
                                scope.vm.returnUrlSuccess = buildReturnUrl('purchaseSuccess', '1');
                                scope.vm.returnUrlFailed = buildReturnUrl('purchaseSuccess', '0');
                                scope.vm.formAction = trustSrc(ENV.purchasePaypalParams.formAction);
                                scope.vm.btnImgSrc = trustSrc(ENV.purchasePaypalParams.btnImgSrc);
                                scope.vm.pixelGifSrc = trustSrc(ENV.purchasePaypalParams.pixelGifSrc);
                                scope.vm.showForm = true;
                            } else {
                                /**
                                 * if case of failure
                                 * TODO: Add atatus notification
                                 */
                                $log.error('Invalid user attributes: userId or userEmail are not defined, cannot build purchase form');
                                scope.vm.showPurchaseError = function () {
                                    purchaseService.hidePurchaseDialog().then(function () {
                                        purchaseService.showPurchaseError();
                                    });
                                };
                            }
                        });
                    }

                    function buildReturnUrl(param, val) {
                        return $location.absUrl().split('?')[0] + addUrlParam($location.search(), param, val);
                    }

                    // http://stackoverflow.com/questions/21292114/external-resource-not-being-loaded-by-angularjs
                    // in order to use src and action attributes that link to external url's,
                    // you should whitelist them
                    function trustSrc(src) {
                        return $sce.trustAsResourceUrl(src);
                    }

                    function addUrlParam(searchObj, key, val) {
                        var search = '';
                        if (!angular.equals(searchObj, {})) {
                            search = '?';
                            // parse the search attribute as a string
                            angular.forEach(searchObj, function (v, k) {
                                search += k + '=' + v;
                            });
                        }

                        var newParam = key + '=' + val,
                            urlParams = '?' + newParam;
                        if (search) {
                            urlParams = search.replace(new RegExp('[\?&]' + key + '[^&]*'), '$1' + newParam);
                            if (urlParams === search) {
                                urlParams += '&' + newParam;
                            }
                        }
                        return urlParams;
                    }
                }

            };
        }
    ]);
})(angular);




//    ********************  mock    *************** //

angular.module('znk.infra-web-app.purchase').service('ENV', function(){
    'use strict';

    var mock = {};
    mock.purchasePaypalParams = {
        hostedButtonId: 3,
        fbDataEndPoint:3,
        firebaseAppScopeName:3,
        formAction:3
    };
});

angular.module('znk.infra-web-app.purchase').service('AuthService', function(){
    'use strict';
    this.getAuth = function(){
        function uid(){
            return 3;
        }
        return uid;
    };
});

angular.module('znk.infra-web-app.purchase').service('UserProfileService', function() {
    'use strict';
    var mock = {};
    mock.getAuth = function(){
        function uid(){
            return 3;
        }
        return uid;
    };

    mock.getProfile = function(){
        return {
            email:'asdsad'
        };
    };
});
//    ********************  mock    *************** //

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

//(function (angular) {
//    'use strict';
//
//    angular.module('znk.infra-web-app.purchase').decorator('purchaseService', function ($delegate) {
//        $delegate.listenToPurchaseStatus = angular.noop;
//        return $delegate;
//    });
//})(angular);

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


angular.module('znk.infra-web-app.purchase').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/purchase/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
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
  $templateCache.put("components/purchase/svg/previous-icon.svg",
    "<svg class=\"previous-icon\" x=\"0px\" y=\"0px\" viewBox=\"-406.9 425.5 190.9 175.7\">\n" +
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
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-1-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 117.5 141\">\n" +
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
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-2-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 124 141\">\n" +
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
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-3-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 117.5 141\">\n" +
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
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-4-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
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
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-5-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 148.7 174.7\"\n" +
    "    style=\"enable-background:new 0 0 148.7 174.7;\">\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M93.4,171.7H12.6c-5.3,0-9.6-4.3-9.6-9.6V81.3c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,167.4,98.7,171.7,93.4,171.7z\"/>\n" +
    "	<path class=\"st0\" d=\"M78.7,71.7V39.9C78.7,19.6,93.8,3,112.2,3h0c18.4,0,33.5,16.6,33.5,36.9v31.9\"/>\n" +
    "	<path class=\"st1\" d=\"M53.2,101c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,106.1,47.1,101,53.2,101\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchaseBtn.template.html",
    "<ng-switch on=\"purchaseState\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "\n" +
    "    <div ng-switch-when=\"pending\">\n" +
    "\n" +
    "        <div class=\"upgraded flex-container\" >\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"pending\">\n" +
    "                    <md-progress-circular md-mode=\"indeterminate\" md-diameter=\"45\"></md-progress-circular>\n" +
    "                    <span class=\"text\" translate=\".UPGRADE_PENDING\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"pro\">\n" +
    "\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"icon-wrapper completed\">\n" +
    "                    <svg-icon name=\"check-mark\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span class=\"text\" translate=\".UPGRADED_ON\" translate-values=\"{upgradeDate: vm.upgradeDate}\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"none\">\n" +
    "\n" +
    "        <ng-switch on=\"vm.showForm\">\n" +
    "            <div ng-switch-when=\"true\">\n" +
    "                <form\n" +
    "                    action=\"{{::vm.formAction}}\"\n" +
    "                    method=\"post\"\n" +
    "                    target=\"_top\">\n" +
    "                    <input type=\"hidden\" name=\"cmd\" value=\"_s-xclick\">\n" +
    "                    <input type=\"hidden\" name=\"hosted_button_id\" ng-value=\"::vm.hostedButtonId\">\n" +
    "                    <input type=\"hidden\" name=\"custom\" ng-value=\"::vm.custom\">\n" +
    "                    <input type=\"hidden\" name=\"return\" ng-value=\"::vm.returnUrlSuccess\">\n" +
    "                    <input type=\"hidden\" name=\"cancel_return\" ng-value=\"::vm.returnUrlFailed\">\n" +
    "                    <input type=\"hidden\" name=\"landing_page\" value=\"billing\">\n" +
    "                    <input type=\"hidden\" name=\"email\" ng-value=\"::vm.userEmail\">\n" +
    "                    <div class=\"upgrade-btn-wrapper\">\n" +
    "                        <button class=\"md-button success drop-shadow inline-block\"\n" +
    "                                ng-click=\"vm.saveAnalytics()\"\n" +
    "                                translate=\".UPGRADE_NOW\"\n" +
    "                                name=\"submit\">\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "                    <input type=\"image\" src=\"{{vm.btnImgSrc}}\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">\n" +
    "                    <img border=\"0\" ng-src=\"{{::vm.pixelGifSrc}}\" width=\"1\" height=\"1\" alt=\"{{vm.translate('PURCHASE_POPUP.PAYPAL_IMG_ALT')}}\" >\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <div ng-switch-default>\n" +
    "                <button ng-click=\"vm.showPurchaseError()\"\n" +
    "                        class=\"md-button success drop-shadow\"\n" +
    "                        translate=\".UPGRADE_NOW\"\n" +
    "                        name=\"submit\">\n" +
    "                </button>\n" +
    "            </div>\n" +
    "\n" +
    "        </ng-switch>\n" +
    "\n" +
    "    </div>\n" +
    "</ng-switch>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchasePopup.template.html",
    "<md-dialog class=\"purchase-popup base-border-radius\" aria-label=\"Get Zinkerz\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "    <div class=\"purchase-popup-container\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"raccoon\">\n" +
    "                <svg-icon name=\"raccoon-logo-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"close-popup-wrap\">\n" +
    "                <svg-icon name=\"close-popup\" ng-click=\"vm.close()\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <h2>\n" +
    "                    <span translate=\".GET_ZINKERZ\"></span>\n" +
    "                    <span class=\"pill pro\" translate=\".PRO\"></span>\n" +
    "                </h2>\n" +
    "                <p translate=\".DESCRIPTION\"></p>\n" +
    "                <div class=\"features-box base-border-radius\">\n" +
    "                    <ul>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-1-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET1\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-2-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET2\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-3-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET3\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-4-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET4\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-5-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET5\"></span>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "                <div class=\"price ng-hide\" ng-show=\"vm.purchaseState === vm.purchaseStateEnum.NONE.enum\">\n" +
    "                    <del>{{'$' + vm.productPreviousPrice}}</del>\n" +
    "                    <b>{{'$' + vm.productPrice}}</b>\n" +
    "                    <span translate=\".SAVE\" translate-values='{ percent: vm.productDiscountPercentage}'></span>\n" +
    "                </div>\n" +
    "                <div class=\"action\">\n" +
    "                    <purchase-btn purchase-state=\"vm.purchaseState\"></purchase-btn>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    //angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
    //    ['purchaseService', 'AuthService', 'UserProfileService', 'PurchaseStateEnum', 'ENV', 'OnBoardingService',


    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',['$scope', '$translatePartialLoader','$mdDialog', '$window', 'purchaseService',
        function($scope,$translatePartialLoader, $mdDialog, $window, purchaseService) {
            $translatePartialLoader.addPart('znkHeader');

            var self = this;
            self.expandIcon = 'expand_more';

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            self.userProfile = {  // mock
                username: 'asdada',
                email:'asdasdasd@zasasdasd'
            };

            this.znkOpenModal = function() {
                this.expandIcon = 'expand_less';
                //OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                //    self.isOnBoardingCompleted = isCompleted;
                //});
            };

            this.subscriptionStatus = '.PROFILE_STATUS_BASIC';  // mock

            $scope.$on('$mdMenuClose', function(){
                self.expandIcon = 'expand_more';
            });

        }]);
})(angular);



(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').directive('znkHeader', [

        function () {
            return {
                    scope: {},
                    restrict: 'E',
                    templateUrl: 'components/znkHeader/templates/znkHeader.template.html',
                    controller: 'znkHeaderCtrl',
                    controllerAs: 'vm'
            };
        }
    ]);
})(angular);


/**
 * znkAnalyticsSrv
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
*                                    objects) with the properties: text and handler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.purchase').provider('znkHeaderSrv',

        function () {
            var additionalHeaderItems = [];

            this.addAdditionalItems = function(additionalHeaderItems) {
                if(!angular.isArray(additionalHeaderItems)){
                    additionalHeaderItems.push(additionalHeaderItems);
                }
                additionalHeaderItems = additionalHeaderItems;
            };

            this.$get ={
                getAdditionalItems: function() {
                    return additionalHeaderItems;
                }
            };
        }

    );
})(angular);


angular.module('znk.infra-web-app.znkHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkHeader/svg/raccoon-logo.svg",
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
  $templateCache.put("components/znkHeader/templates/znkHeader.template.html",
    "<div class=\"app-header\" translate-namespace=\"ZNK_HEADER\">\n" +
    "    <div class=\"main-content-header\" layout=\"row\" layout-align=\"start start\">\n" +
    "        <svg-icon class=\"raccoon-logo-icon\"\n" +
    "                  name=\"raccoon-logo-icon\"\n" +
    "                  ui-sref=\"app.workouts.roadmap\"\n" +
    "                  ui-sref-opts=\"{reload: true}\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"app-states-list\">\n" +
    "            <md-list flex=\"grow\" layout=\"row\" layout-align=\"start center\">\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".WORKOUTS\"></span>\n" +
    "                    <a ui-sref=\"app.workouts.roadmap\"\n" +
    "                       ui-sref-opts=\"{reload: true}\"\n" +
    "                       class=\"link-full-item\">\n" +
    "                    </a>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".TESTS\"></span>\n" +
    "                    <a ui-sref=\"app.tests.roadmap\" class=\"link-full-item\"></a>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".TUTORIALS\"></span>\n" +
    "                    <a ui-sref=\"app.tutorials.roadmap\" class=\"link-full-item\"></a>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".PERFORMANCE\"></span>\n" +
    "                    <a ui-sref=\"app.performance\" class=\"link-full-item\"></a>\n" +
    "                </md-list-item>\n" +
    "            </md-list>\n" +
    "\n" +
    "            <!--<md-list ng-repeat=\"vm.additionalFileds\">-->\n" +
    "                <!--<span class=\"title\" translate=\".PERFORMANCE\"></span>-->\n" +
    "                <!--<a ui-sref=\"app.performance\" class=\"link-full-item\"></a>-->\n" +
    "            <!--</md-list>-->\n" +
    "\n" +
    "        </div>\n" +
    "        <div class=\"app-user-area\" layout=\"row\" layout-align=\"center center\">\n" +
    "            <invitation-manager></invitation-manager>\n" +
    "            <div class=\"profile-status\" ng-click=\"vm.showPurchaseDialog()\">\n" +
    "                <div class=\"pending-purchase-icon-wrapper\" ng-if=\"vm.purchaseState === 'pending'\">\n" +
    "                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "            </div>\n" +
    "            <md-menu md-offset=\"-61 68\">\n" +
    "                <md-button ng-click=\"$mdOpenMenu($event); vm.znkOpenModal();\"\n" +
    "                           class=\"md-icon-button profile-open-modal-btn\"\n" +
    "                           aria-label=\"Open sample menu\">\n" +
    "                    <div>{{::vm.userProfile.username}}</div>\n" +
    "                    <md-icon class=\"material-icons\">{{vm.expandIcon}}</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content class=\"md-menu-content-znk-header\">\n" +
    "                    <md-list>\n" +
    "                        <md-list-item class=\"header-modal-item header-modal-item-profile\">\n" +
    "                            <span class=\"username\">{{::vm.userProfile.username}}</span>\n" +
    "                            <span class=\"email\">{{::vm.userProfile.email}}</span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple class=\"header-modal-item header-modal-item-uppercase links purchase-status\">\n" +
    "                            <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "                            <span class=\"link-full-item\" ng-click=\"vm.showPurchaseDialog()\"></span>\n" +
    "                            <ng-switch on=\"vm.purchaseState\">\n" +
    "                                <div ng-switch-when=\"pending\" class=\"pending-purchase-icon-wrapper\">\n" +
    "                                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                                <div ng-switch-when=\"pro\" class=\"check-mark-wrapper\">\n" +
    "                                    <svg-icon name=\"check-mark\"></svg-icon>\n" +
    "                                </div>\n" +
    "                            </ng-switch>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span ng-disabled=\"!vm.isOnBoardingCompleted\"\n" +
    "                                  ng-click=\"vm.showGoalsEdit()\"\n" +
    "                                  translate=\".PROFILE_GOALS\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span ng-click=\"vm.showChangePassword()\" translate=\".PROFILE_CHANGE_PASSWORD\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <a ui-sref=\"app.faq\">\n" +
    "                                <span translate=\".WHAT_IS_THE_ACT_TEST\"></span>\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <a ng-href=\"http://zinkerz.com/contact/\" target=\"_blank\">\n" +
    "                                <span translate=\".PROFILE_SUPPORT\"></span>\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <div class=\"divider\"></div>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase logout\">\n" +
    "                            <span ng-click=\"vm.logout()\" translate=\".PROFILE_LOGOUT\"></span>\n" +
    "                        </md-list-item>\n" +
    "                    </md-list>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', []);
})(angular);
