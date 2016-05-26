/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').directive('purchaseBtn',
        function (ENV, $q, $sce, AuthService, UserProfileService, $location, purchaseService, $filter, PurchaseStateEnum, $log, $translatePartialLoader, znkAnalyticsSrv) {
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

                    scope.vm.saveAnalytics = function () {
                        znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderStarted' });
                    };

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
    );
})(angular);
