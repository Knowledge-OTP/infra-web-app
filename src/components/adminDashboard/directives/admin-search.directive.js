/* eslint new-cap: 0 */


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.adminDashboard').directive('adminSearch',
        function () {
            'ngInject';

            var directive = {
                templateUrl: 'components/adminDashboard/directives/admin-search.template.html',
                restrict: 'EA',
                controllerAs: 'vm',
                controller: AdminSearchController,
                scope: {
                    searchQuery: "=",
                    searchResults: "=",
                    state: "=",
                    data: "=",
                    key: "@",
                    placeholder: "@",
                    minlength: "@"
                },
                bindToController: true,
                link: linkFunc
            };

            function linkFunc(scope, elm, attr, ctrl) {
                var currentElement = angular.element(elm);
                var input = currentElement.find('input');
                input.on('input', function (e) {
                    if (e.target.value === "") {
                        scope.$apply(function () {
                            ctrl.data = [];
                            ctrl.state[ctrl.key].initial = true;
                        });
                    }

                });
            }

            function AdminSearchController() {
                var self = this;
                self.minlength = self.minlength || '3';

            }

            return directive;
        });

})(angular);
