(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.activePanel').service('ActivePanelSrv',
        function ($document, $compile, $rootScope) {
            'ngInject';

            var self = this;

            self.loadActivePanel = loadActivePanel;

            function loadActivePanel() {
                var body = angular.element($document).find('body');

                var canvasContainerElement = angular.element(
                    '<active-panel></active-panel>'
                );

                if (!angular.element(body[0].querySelector('active-panel')).length) {
                    self.scope = $rootScope.$new(true);
                    body.append(canvasContainerElement);
                    $compile(canvasContainerElement.contents())(self.scope);
                }
            }
        });
})(angular);
