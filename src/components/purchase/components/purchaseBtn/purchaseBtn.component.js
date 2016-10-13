(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .component('purchaseBtn', {
            bindings: {
                purchaseState: '='
            },
            templateUrl:  'components/purchase/components/purchaseBtn/purchaseBtn.template.html',
            controllerAs: 'vm',
            controller: function ($scope, ENV, $q, $sce, AuthService, $location, purchaseService, $timeout,
                                  $filter, PurchaseStateEnum, $log, $translatePartialLoader, znkAnalyticsSrv) {
                'ngInject';

                $translatePartialLoader.addPart('purchase');

                var vm = this;

                vm.showForm = false;
                vm.translate = $filter('translate');

                vm.saveAnalytics = function () {
                    vm.purchaseState = PurchaseStateEnum.PENDING.enum;
                    znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderStarted' });
                };

                $scope.$watch(function () {
                    return vm.purchaseData;
                }, function (newPurchaseState) {
                    if (angular.isUndefined(newPurchaseState)) {
                        return;
                    }

                    if (newPurchaseState === PurchaseStateEnum.NONE.enum) {
                        buildForm();
                    }

                    if (newPurchaseState === PurchaseStateEnum.PRO.enum) {
                        $q.when(purchaseService.purchaseDataExists()).then(function (purchaseData) {
                            if (!angular.equals(purchaseData, {})){
                                vm.upgradeDate = $filter('date')(purchaseData.creationTime, 'mediumDate');
                            }
                        });
                    }
                });

                function buildForm() {
                    $q.all([AuthService.getAuth(), purchaseService.getProduct()]).then(function (results) {
                        var userEmail = results[0].auth.email;
                        var userId = results[0].auth.uid;
                        var productId = results[1].id;

                        if (userEmail && userId) {
                            vm.userEmail = userEmail;
                            vm.hostedButtonId = ENV.purchasePaypalParams.hostedButtonId;
                            vm.custom = userId + '#' + productId + '#' + ENV.fbDataEndPoint + '#' + ENV.firebaseAppScopeName;  // userId#productId#dataEndPoint#appName
                            vm.returnUrlSuccess = buildReturnUrl('purchaseSuccess', '1');
                            vm.returnUrlFailed = buildReturnUrl('purchaseSuccess', '0');
                            vm.formAction = trustSrc(ENV.purchasePaypalParams.formAction);
                            vm.btnImgSrc = trustSrc(ENV.purchasePaypalParams.btnImgSrc);
                            vm.pixelGifSrc = trustSrc(ENV.purchasePaypalParams.pixelGifSrc);
                            vm.showForm = true;
                        } else {
                            /**
                             * if case of failure
                             * TODO: Add atatus notification
                             */
                            $log.error('Invalid user attributes: userId or userEmail are not defined, cannot build purchase form');
                        }
                    });
                }

                vm.showPurchaseError = function () {
                    purchaseService.hidePurchaseDialog().then(function () {
                        purchaseService.showPurchaseError();
                    });
                };

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
        });
})(angular);
