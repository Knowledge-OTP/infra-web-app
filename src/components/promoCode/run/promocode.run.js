(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode')
        .run(function ($location, PromoCodeSrv, AuthService, PopUpSrv, $filter, ENV) {
        'ngInject';
        var authData = AuthService.getAuth();
        var translate = $filter('translate');


        if (authData && authData.uid) {
            var search = $location.search();
            var promoCodeId = search.pcid;
            var appContext = ENV.firebaseAppScopeName;

            delete search.pcid;

            if (angular.isDefined(promoCodeId)) {
                PromoCodeSrv.updatePromoCode(authData.uid, promoCodeId, appContext).then(function () {
                    var successTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                    var SuccessMsg = translate('PROMO_CODE.PROMO_CODE_SUCCESS_MESSAGE');
                    PopUpSrv.success(successTitle, SuccessMsg);
                }).catch(function () {
                    var errorTitle = translate('PROMO_CODE.PROMO_CODE_TITLE');
                    var errorMsg = translate('PROMO_CODE.PROMO_CODE_ERROR_MESSAGE');
                    PopUpSrv.error(errorTitle, errorMsg);
                });
            }
        }
    });

})(angular);
