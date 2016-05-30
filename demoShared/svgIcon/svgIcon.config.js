'use strict';

angular.module('demo')
    .config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'math-icon': 'svgIcon/math-icon.svg',
                'reading-icon': 'svgIcon/math-icon.svg',
                'writing-icon': 'svgIcon/math-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
