(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.oneSignal',
        [
            'ngAnimate',
            'ui.router',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics'
        ]);
})(angular);


(function () {
  'use strict';

  angular.module('znk.infra-web-app.oneSignal').run(
    ["$log", "OneSignalService", "ENV", "AuthService", function ($log, OneSignalService, ENV, AuthService) {
      'ngInject';

        OneSignalService.initOneSignal();

        OneSignalService.sendTag('ServiceId', ENV.serviceId, (res) => {
            $log.debug('tags received by server', res);
        });

        AuthService.getAuth().then(authData => {
            if (authData && authData.uid) {
                OneSignalService.sendTag('UID', authData.uid, (res) => {
                    $log.debug('tags received by server', res);
                });
            }
        });
    }]);
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.oneSignal')
        .service('OneSignalService',
            ["$log", "ENV", "$window", function ($log, ENV, $window) {
                'ngInject';

                $log.debug('OneSignalService: Init');
                const ONE_SIGNAL_SCRIPT_URL = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
                const MANIFEST_PATH = '../assets/files/manifest.json';
                loadManifestLink();
                loadOneSignalScript();

                // https://documentation.onesignal.com/docs/web-push-sdk#section--init-
                this.initOneSignal = () => {
                    const oneSignal = $window.OneSignal || [];
                    oneSignal.push(() => {
                        oneSignal.init({
                            appId: ENV.oneSignalAppId,
                            allowLocalhostAsSecureOrigin: true
                        });
                    });
                };

                this.sendTag = (key, value, callback) => {
                    const oneSignal = $window.OneSignal || [];
                    oneSignal.push(() => {
                        oneSignal.sendTag(key, value, callback);
                    });
                };

                // Load manifest link <link rel="manifest" href="/manifest.json" />
                function loadManifestLink() {
                    const linkTag = document.getElementsByTagName('link')[0];
                    const newLinkElm = $window.document.createElement('link');
                    newLinkElm.href = MANIFEST_PATH;
                    newLinkElm.rel = 'manifest';
                    linkTag.parentNode.insertBefore(newLinkElm,linkTag);
                }

                // Load oneSignal module <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async></script>
                function loadOneSignalScript() {
                    const scriptTag = document.getElementsByTagName('script')[0];
                    const newScriptElm = $window.document.createElement('script');
                    newScriptElm.src = ONE_SIGNAL_SCRIPT_URL;
                    newScriptElm.async = true;
                    scriptTag.parentNode.insertBefore(newScriptElm,scriptTag);
                }

            }]
        );
})(angular);

angular.module('znk.infra-web-app.oneSignal').run(['$templateCache', function ($templateCache) {

}]);
