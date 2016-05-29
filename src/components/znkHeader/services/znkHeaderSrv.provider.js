/**
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

            this.addAdditionalItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalHeaderItems.push(additionalItems);
                } else {
                    additionalHeaderItems = additionalItems;
                }
            };

            this.$get = [function () {
                return {
                    getAdditionalItems: function () {
                        return additionalHeaderItems;
                    }
                };
            }];

        }
    );
})(angular);

