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

    angular.module('znk.infra-web-app.stripe')
        .service('StripeService',
            ["$log", "$q", "$window", "$filter", "$http", "AuthService", "ENV", function ($log, $q, $window, $filter, $http, AuthService, ENV) {
                'ngInject';

                const stripeToken = ENV.stripeToken;
                const translate = $filter('translate');
                const paymentApi = `${ENV.znkBackendBaseUrl}/payment`;

                /**
                 * Open stripe payment modal foe instant payment.
                 * @returns StripeResult object{Subject<boolean>}
                 *
                 * stripe test card 4242 4242 4242 4242
                 */
                this.openStripeModal = (amount, name, description, image) => {
                    let tokenId = null;
                    const defer = $q.defer();
                    const handler = ($window).StripeCheckout.configure({
                        key: stripeToken,
                        amount: amount ? amount * 100 : 0, // amount to display: ex: $20 * 100 === $20.00
                        locale: 'auto',
                        token: token => tokenId = token.id
                    });
                    handler.open({
                        name: name || 'Zinkerz',
                        description: description || translate('STRIPE.DESCRIPTION'),
                        image: image || 'assets/images/zinkerz_stripe_logo.jpg',
                        panelLabel: translate('STRIPE.PAY'),
                        closed: () => defer.resolve(handleModalClosed(tokenId, amount, description))
                    });

                    return defer.promise;
                };

                function handleModalClosed(tokenId, amount, description) {
                    let resToReturn = { closedByUser: true };
                    if (tokenId) {
                        resToReturn = createInstantCharge(tokenId, amount, description);
                    }

                    return resToReturn;
                }

                function createInstantCharge(tokenId, amount, description) {
                    const createInstantChargeApi = `${paymentApi}/createinstantcharge`;
                    return AuthService.getAuth().then(authData => {
                        const stripeVars = {
                            token: tokenId,
                            uid: authData.uid,
                            amount: amount,
                            description: description,
                            currency: 'usd'
                        };

                        return $http.post(createInstantChargeApi, stripeVars)
                            .then(res => res.data)
                            .catch((err) => $log.error('createInstantCharge: Error: ', err));
                    });
                }

            }]
        );
})(angular);

angular.module('znk.infra-web-app.stripe').run(['$templateCache', function($templateCache) {

}]);
