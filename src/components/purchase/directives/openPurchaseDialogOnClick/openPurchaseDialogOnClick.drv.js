/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').directive('openPurchaseDialogOnClick',
        function (purchaseService) {
            'ngInject';
            return {
                restrict: 'A',
                controller: function($element) {
                    $element.on('click', function() {
                        purchaseService.showPurchaseDialog();
                    });

                    $element.on('$destroy', function(){
                        $element.off('click');
                    });
                }
            };
        }
    );
})(angular);
