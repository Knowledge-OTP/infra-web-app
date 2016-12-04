(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .config(
            function (SvgIconSrvProvider) {
                'ngInject';
                var svgMap = {
                    'purchase-check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'purchase-close-popup': 'components/purchase/svg/purchase-close-popup.svg',
                    'sheet-icon': 'components/purchase/svg/sheet-icon.svg',
                    'note-and-pencil': 'components/purchase/svg/note-and-pencil.svg',
                    'question-mark-square': 'components/purchase/svg/question-mark-square.svg',
                    'grail-icon': 'components/purchase/svg/grail-icon.svg',
                    'open-lock-icon': 'components/purchase/svg/open-lock-icon.svg',
                    'purchase-raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            });
})(angular);
