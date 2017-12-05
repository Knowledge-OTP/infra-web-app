(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').service('PromoCodeTypeEnum',
        function(EnumSrv) {
            'ngInject';
            var PromoCodeTypeEnum = new EnumSrv.BaseEnum([
                ['FREE_LICENSE', 1, 'free license'],
                ['ZINKERZ_EDUCATOR', 2, 'zinkerz educator'],
            ]);

            return PromoCodeTypeEnum;
        });
})(angular);
