/**
 * znkAnalyticsSrv
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
*                                    objects) with the properties: text and handler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalHeaderItems = [];

            this.addAdditionalItems = function(additionalHeaderItems) {
                if(!angular.isArray(additionalHeaderItems)){
                    additionalHeaderItems.push(additionalHeaderItems);
                }
                additionalHeaderItems = additionalHeaderItems;
            };

            this.$get ={
                getAdditionalItems: function() {
                    return additionalHeaderItems;
                }
            };
        }

    );
})(angular);

