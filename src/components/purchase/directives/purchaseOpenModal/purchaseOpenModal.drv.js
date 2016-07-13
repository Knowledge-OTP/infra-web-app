/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').directive('purchaseOpenModal',
        function (purchaseService) {
            'ngInject';

            return {
                restrict: 'A',
                controller: function($element) {
                    $element.bind('click', function() {
                        purchaseService.showPurchaseDialog();
                    });

                    $element.on('$destroy', function(){
                        $element.unbind('click');
                    });
                }
            };
        }
    );
})(angular);
