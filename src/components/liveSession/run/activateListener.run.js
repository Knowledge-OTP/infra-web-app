(function(){
    'use strict';

    angular.module('znk.infra-web-app.liveSession').run(
        // execute in APP load, to add event listener to both student and educator active session paths
        function(ActivePanelSrv, LiveSessionEventsSrv){
            'ngInject';
            ActivePanelSrv.loadActivePanel();
            LiveSessionEventsSrv.activate();
        }
    );
})();
