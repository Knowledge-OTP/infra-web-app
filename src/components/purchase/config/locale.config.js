(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "PURCHASE_POPUP": {
                            "GET_ZINKERZ": "Zinkerz ",
                            "PRO": "Pro",
                            "DESCRIPTION": "Get the most out of Zinkerz",
                            "BULLET1": "Full TOEFL® Practice Tests",
                            "BULLET2": "Personalized Workouts",
                            "BULLET3": "2000+ Practice Questions",
                            "BULLET4": "Estimated Score",
                            "BULLET5": "Unlimited lifetime access",
                            "SAVE": "(save {{percent}})",
                            "UPGRADE_NOW": "Upgrade Now",
                            "UPGRADED_ON": "Upgraded on {{upgradeDate}}",
                            "UPGRADE_PENDING": "Processing payment...",
                            "UPGRADE_ERROR_POPUP_TITLE": "Purchase Error",
                            "UPGRADE_ERROR_POPUP_CONTENT": "There has been a problem with the purchase process, please refresh the page and try again",
                            "PAYPAL_IMG_ALT": "PayPal - The safer, easier way to pay online!",
                            "PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT": "You've completed all free workouts. It's time to upgrade.",
                            "PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT": "Lets do it!",
                            "PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT": "Workout {{num}} completed! Upgrade to Zinkerz PRO to get everything you need to ace the TOEFL text.",
                            "PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT": "Lets do it!"
                        }
                    }
                );
            });
})(angular);
