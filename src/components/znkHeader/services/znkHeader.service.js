/**
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
 *                                    objects) with the properties: text and onClickHandler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalNavMenuItems = [];

            this.addAdditionalNavMenuItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalNavMenuItems.push(additionalItems);
                } else {
                    additionalNavMenuItems = additionalItems;
                }
            };

            this.$get = function () {
                'ngInject';
                var navItemsArray = [];

                function addDefaultNavItem(_text, _goToState, _stateOpt) {

                    var navItem = {
                        text: _text,
                        goToState: _goToState,
                        stateOpt: _stateOpt
                    };

                    navItemsArray.push(navItem);
                }

                addDefaultNavItem('ZNK_HEADER.WORKOUTS', 'app.workouts.roadmap', { reload: true });
                addDefaultNavItem('ZNK_HEADER.TESTS', 'app.tests.roadmap');
                addDefaultNavItem('ZNK_HEADER.TUTORIALS', 'app.tutorials.roadmap');
                addDefaultNavItem('ZNK_HEADER.PERFORMANCE', 'app.performance');
                addDefaultNavItem('ZNK_HEADER.ETUTORING', 'app.eTutoring');

                return {
                    getAdditionalItems: function () {
                        return navItemsArray.concat(additionalNavMenuItems);  // return array of default nav items with additional nav items
                    }
                };
            };

        }
    );
})(angular);

