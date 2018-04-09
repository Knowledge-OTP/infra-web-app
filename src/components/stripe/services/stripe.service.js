(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.stripe')
        .service('StripeService',
            function ($log, $q, $window, $filter, $http, AuthService, ENV) {
                'ngInject';

                const stripeToken = ENV.stripeToken;
                let paymentApi = `${ENV.znkBackendBaseUrl}/payment`;

                /**
                 * Open stripe payment modal foe instant payment.
                 * @returns StripeResult object{Subject<boolean>}
                 *
                 * stripe test card 4242 4242 4242 4242
                 */
                this.openStripeModal = (amount, name, description, image) => {
                    function createInstantCharge(token) {
                        this.token = token;
                        const createInstantChargeApi = `${paymentApi}/createinstantcharge`;
                        AuthService.getAuth().then(authData => {
                            this.stripeVars.uid = authData.uid;
                            this.stripeVars.token = this.token.id;
                            $http.post(createInstantChargeApi, this.stripeVars)
                                .then(res => {
                                    defer.resolve(res.data);
                                })
                                .catch((err) => $log.error('createInstantCharge: Error: ', err));
                        });
                    }

                    const defer = $q.defer();
                    const handler = ($window).StripeCheckout.configure({
                        key: stripeToken,
                        amount: amount * 100, // amount to display: ex: $20 * 100 === $20.00
                        locale: 'auto',
                        token: createInstantCharge.bind(this)
                    });
                    const translate = $filter('translate');
                    this.stripeVars = {
                        uid: null,
                        amount: amount,
                        currency: 'usd',
                        description: description
                    };

                    handler.open({
                        name: name || 'Zinkerz',
                        description: description || translate('STRIPE.DESCRIPTION'),
                        image: image || 'stripe/assets/images/zinkerz_stripe_logo.jpg',
                        panelLabel: translate('STRIPE.PAY'),
                        closed: () => {
                            if (!this.token) {
                                defer.resolve({ closedByUser: true });
                            }
                        }
                    });

                    return defer.promise;
                };

            }
        );
})(angular);
