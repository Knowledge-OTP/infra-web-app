(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.stripe',
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
            'znk.infra.analytics'
        ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.stripe').service('CurrencyEnum',['EnumSrv',
        function(EnumSrv) {

            return new EnumSrv.BaseEnum([
                ['USD', 'usd', 'USD']
            ]);

        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.stripe')
        .service('StripeService',
            ["$log", "$q", "$window", "$filter", "$http", "AuthService", "ENV", "CurrencyEnum", "InfraConfigSrv", "purchaseService", "StorageSrv", function ($log, $q, $window, $filter, $http, AuthService, ENV, CurrencyEnum, InfraConfigSrv, purchaseService, StorageSrv) {
                'ngInject';

                const stripeToken = ENV.stripeToken;
                const translate = $filter('translate');
                const paymentApi = `${ENV.znkBackendBaseUrl}/payment`;
                const STRIPE_SCRIPT_URL = 'https://checkout.stripe.com/checkout.js';
                loadStripeScript();

                /**
                 * Open stripe payment modal foe instant payment.
                 * @returns StripeResult object{Subject<boolean>}
                 *
                 * stripe test card 4242 4242 4242 4242
                 */
                this.openStripeModal = (serviceId, productId, amount, name, description, image) => {
                    let tokenId = null;
                    const defer = $q.defer();
                    const amountInCents = amount ? amount * 100 : 0; // amount to display: ex: $20 * 100 === $20.00
                    const handler = ($window).StripeCheckout.configure({
                        key: stripeToken,
                        amount: amountInCents,
                        locale: 'auto',
                        token: token => tokenId = token.id
                    });
                    handler.open({
                        name: name || 'Zinkerz',
                        description: description || translate('STRIPE.DESCRIPTION'),
                        image: image || 'assets/images/zinkerz_stripe_logo.jpg',
                        panelLabel: translate('STRIPE.PAY'),
                        currency: CurrencyEnum.USD.val,
                        closed: () => defer.resolve(handleModalClosed(serviceId, productId, tokenId, amount, description))
                    });

                    return defer.promise;
                };

                // Load stripe module <script src="https://checkout.stripe.com/checkout.js"></script>
                function loadStripeScript() {
                    const scriptTag = document.getElementsByTagName('script')[0];
                    const newScriptElm = $window.document.createElement('script');
                    newScriptElm.src = STRIPE_SCRIPT_URL;
                    scriptTag.parentNode.insertBefore(newScriptElm,scriptTag);
                }

                function handleModalClosed(serviceId, productId, tokenId, amount, description) {
                    let resToReturn = { closedByUser: true };
                    if (tokenId) {
                        // Write to pending purchase path until the backend webhook will confirm the purchase
                        resToReturn = $q.all([InfraConfigSrv.getStudentStorage(), purchaseService.getPath('pending')])
                            .then(([studentStorage, pendingPurchasesPath]) => {
                                const pendingPurchaseVal = {
                                    id: productId,
                                    purchaseTime: StorageSrv.variables.currTimeStamp
                                };
                                return studentStorage.set(pendingPurchasesPath, pendingPurchaseVal)
                                    .then(() => createInstantCharge(serviceId, productId, tokenId, amount, description));
                            });
                    }

                    return resToReturn;
                }

                function createInstantCharge(serviceId, productId, tokenId, amount, description) {
                    const createInstantChargeApi = `${paymentApi}/createinstantcharge`;
                    return AuthService.getAuth().then(authData => {
                        if (authData && authData.uid) {
                            const stripeVars = {
                                serviceId: serviceId,
                                productId: productId,
                                token: tokenId,
                                uid: authData.uid,
                                amount: amount,
                                description: description,
                                currency: CurrencyEnum.USD.enum
                            };

                            return $http.post(createInstantChargeApi, stripeVars)
                                .then(res => res.data)
                                .catch((err) => $log.error('createInstantCharge: Error: ', err));
                        } else {
                            $log.error('createInstantCharge: Error: uid is required');
                            return $q.reject(null);
                        }

                    });
                }

            }]
        );
})(angular);

angular.module('znk.infra-web-app.stripe').run(['$templateCache', function ($templateCache) {

}]);
