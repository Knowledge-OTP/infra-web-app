(function (angular) {
  'use strict';

  angular.module('znk.infra-web-app.activePanel')
    .config(function (SvgIconSrvProvider) {
      'ngInject';

      var svgMap = {
        'active-panel-call-mute-icon': 'components/calls/svg/call-mute-icon.svg',
        'active-panel-stop-sharing-icon': 'components/activePanel/svg/stop-sharing-icon.svg',
        'active-panel-share-screen-icon': 'components/activePanel/svg/share-screen-icon.svg',
        'active-panel-track-teacher-icon': 'components/activePanel/svg/track-teacher-icon.svg',
        'active-panel-track-student-icon': 'components/activePanel/svg/track-student-icon.svg',
        'hangouts-icon': 'components/activePanel/svg/hangouts.svg'
      };
      SvgIconSrvProvider.registerSvgSources(svgMap);
    });
})(angular);
