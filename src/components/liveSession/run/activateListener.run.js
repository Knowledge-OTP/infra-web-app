(function(){
    'use strict';

    angular.module('znk.infra-web-app.liveSession').run(
        function(ActivePanelSrv, LiveSessionEventsSrv){
            'ngInject';
            ActivePanelSrv.loadActivePanel();
            LiveSessionEventsSrv.activate();
        }
    );
})();
