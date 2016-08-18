(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper')
        .config(function (TimelineSrvProvider) {
            'ngInject';
            TimelineSrvProvider.setImages({
                drill: 'components/znkTimeline/svg/icons/timeline-drills-icon.svg',
                game: 'components/znkTimeline/svg/icons/timeline-mini-challenge-icon.svg',
                tutorial: 'components/znkTimeline/svg/icons/timeline-tips-tricks-icon.svg',
                diagnostic: 'components/znkTimeline/svg/icons/timeline-diagnostic-test-icon.svg',
                section: 'components/znkTimeline/svg/icons/timeline-test-icon.svg'
            });
        });
})(angular);

