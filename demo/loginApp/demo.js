angular.module('demo', ['znk.infra-web-app.loginApp', 'demoEnv', 'znk.infra-web-app.promoCode'])
    .config(function ($translateProvider, $locationProvider, PromoCodeSrvProvider, AllEnvConfigSrvProvider, LoginAppSrvProvider) {
        'ngInject';
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');


            var allEnvConfigObj = AllEnvConfigSrvProvider.getAllEnvJstringObj();

            var envName = LoginAppSrvProvider.getEnv();

            var allEnvConfKeys = Object.keys(allEnvConfigObj[envName]);

            var promoCodeBackendData = {};

            _buildBackendData(envName, allEnvConfKeys);

            function _buildBackendData(envName, keys) {
                angular.forEach(keys, function (key) {
                    promoCodeBackendData[key] = {
                        backendEndpoint: allEnvConfigObj[envName][key].backendEndpoint,
                        firebaseAppScopeName: allEnvConfigObj[envName][key].firebaseAppScopeName
                    };
                });
            }

            PromoCodeSrvProvider.setBackendData(promoCodeBackendData);
    })
    .run(function ($rootScope, $translate) {

        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
    })
    .provider('AllEnvConfigSrv',
    function () {
        var allEnvObj = _createAndGetAllEnvObject();
        this.getAllEnvJstringObj = function () {
            return allEnvObj;
        };
        function _createAndGetAllEnvObject() {
            var allEnvJson = {
                "dev": {
                    "ACT": {
                        "appName": "act-app-web",
                        "firebaseAppScopeName": "act_app",
                        "firebaseDashboardAppScopeName": "act_dashboard",
                        "fbGlobalEndPoint": "https://znk-dev.firebaseio.com/",
                        "fbDataEndPoint": "https://act-dev.firebaseio.com/",
                        "gaTrackingId": "UA-58469239-11",
                        "fbqId": "764164503681608",
                        "mixpanelId": "8e3383ffcbfae39f60da410f2bb67b37",
                        "atatusApiKey": "79eea0b49c5f47f9827d435741d0e4ea",
                        "enableAtatusLog": true,
                        "debug": true,
                        "enableAnalytics": false,
                        "segment_io_key": "",
                        "backendEndpoint": "https://znk-web-backend-dev.azurewebsites.net/",
                        "dataAuthSecret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
                        "promiseTimeOut": 15000,
                        "dreamSchoolJsonUrl": "/assets/json/dreamSchools.json",
                        "facebookAppId": "1557255967927879",
                        "googleAppId": "144375962953-sundkbnv8ptac26bsnokc74lo2pmo8sb.apps.googleusercontent.com",
                        "doorbellApiKey": "44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "doorbellId": "3084",
                        "doorBellSubmitURL": "https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "purchasePaypalParams": {
                            "formAction": "https://www.sandbox.paypal.com/cgi-bin/webscr",
                            "hostedButtonId": "SYEKB94SNYBMJ",
                            "btnImgSrc": "https://www.sandbox.paypal.com/en_US/i/btn/btn_buynow_LG.gif",
                            "pixelGifSrc": "https://www.sandbox.paypal.com/en_US/i/scr/pixel.gif"
                        },
                        "zinkerzWebsiteBaseUrl": "//zinkerz.com/",
                        "zinkezWebsiteUrl": "//zinkerz.com/act/",
                        "actDashboardWebSiteUrl": "//www.zinkerz.com/act-educator/",
                        "mediaEndpoint": "//dfz02hjbsqn5e.cloudfront.net",
                        "videosEndPoint": "//dfz02hjbsqn5e.cloudfront.net/act_app/",
                        "enforceZinkerzDomainSignup": true,
                        "redirectLogout": "login.html",
                        "redirectLogin": "index.html",
                        "redirectSignup": "index.html",
                        "welcomeBackHintInDays": 5,
                        "dashboardFeatureEnabled": true,
                        "version": "1.0.0",
                        "appContext": "student",
                        "studentAppName": "act_app",
                        "dashboardAppName": "act_dashboard",
                        "userIdleTime": 300,
                        "idleTimeout": 0,
                        "idleKeepalive": 2,
                        "teachworksDataUrl": "teachworks",
                        "plivoUsername": "ZinkerzDev160731091034",
                        "plivoPassword": "zinkerz$9999",
                        "supportEmail": "support@zinkerz.com"
                    },
                    "SAT": {
                        "appName": "sat-app-web",
                        "firebaseAppScopeName": "sat_app",
                        "firebaseDashboardAppScopeName": "sat_dashboard",
                        "fbGlobalEndPoint": "https://znk-dev.firebaseio.com/",
                        "fbDataEndPoint": "https://sat-dev.firebaseio.com/",
                        "gaTrackingId": "",
                        "mixpanelId": "e458b332bfcffeb0c4a83612a061c2e0",
                        "atatusApiKey": "78d05e58d63c4a959fc94dcc482af9ed",
                        "enableAtatusLog": true,
                        "debug": true,
                        "enableAnalytics": false,
                        "segment_io_key": "",
                        "backendEndpoint": "https://znk-web-backend-dev.azurewebsites.net/",
                        "dataAuthSecret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
                        "promiseTimeOut": 15000,
                        "dreamSchoolJsonUrl": "/assets/json/dreamSchools.json",
                        "facebookAppId": "1624086287830120",
                        "googleAppId": "1008364992567-hpchkt4nuo4eosjfrbpqrm1ruamg62nj.apps.googleusercontent.com",
                        "doorbellApiKey": "44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "doorbellId": "3084",
                        "doorBellSubmitURL": "https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "purchasePaypalParams": {
                            "formAction": "https://www.sandbox.paypal.com/cgi-bin/webscr",
                            "hostedButtonId": "J2J2GMDNZCMBU",
                            "btnImgSrc": "https://www.sandbox.paypal.com/en_US/i/btn/btn_buynow_LG.gif",
                            "pixelGifSrc": "https://www.sandbox.paypal.com/en_US/i/scr/pixel.gif"
                        },
                        "zinkerzWebsiteBaseUrl": "//zinkerz.com/",
                        "zinkezWebsiteUrl": "//zinkerz.com/sat",
                        "actDashboardWebSiteUrl": "//www.zinkerz.com/sat-educator/",
                        "videosEndPoint": "//dfz02hjbsqn5e.cloudfront.net/sat_app",
                        "enforceZinkerzDomainSignup": true,
                        "redirectLogout": "login.html",
                        "redirectLogin": "index.html",
                        "redirectSignup": "index.html",
                        "welcomeBackHintInDays": 5,
                        "dashboardFeatureEnabled": true,
                        "version": "1.0.0",
                        "appContext": "student",
                        "studentAppName": "sat_app",
                        "dashboardAppName": "sat_dashboard",
                        "userIdleTime": 300,
                        "idleTimeout": 0,
                        "idleKeepalive": 2,
                        "teachworksDataUrl": "teachworks",
                        "plivoUsername": "ZinkerzDev160731091034",
                        "plivoPassword": "zinkerz$9999",
                        "mediaEndpoint": "//dfz02hjbsqn5e.cloudfront.net",
                        "supportEmail": "support@zinkerz.com"
                    },
                    "TOEFL": {
                        "firebaseAppScopeName": "toefl_app",
                        "firebaseDashboardAppScopeName": "toefl_dashboard",
                        "fbGlobalEndPoint": "https://znk-dev.firebaseio.com/",
                        "fbDataEndPoint": "https://znk-toefl-dev.firebaseio.com/",
                        "gaTrackingId": "UA-58469239-11",
                        "mixpanelId": "8e3383ffcbfae39f60da410f2bb67b37",
                        "atatusApiKey": "cb104224794b4b139a0e87263d93880f",
                        "enableAtatusLog": true,
                        "debug": true,
                        "enableAnalytics": false,
                        "segment_io_key": "",
                        "backendEndpoint": "https://znk-web-backend-dev.azurewebsites.net/",
                        "dataAuthSecret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
                        "promiseTimeOut": 15000,
                        "dreamSchoolJsonUrl": "/assets/json/dreamSchools.json",
                        "facebookAppId": "1557255967927879",
                        "googleAppId": "144375962953-sundkbnv8ptac26bsnokc74lo2pmo8sb.apps.googleusercontent.com",
                        "doorbellApiKey": "44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "doorbellId": "3084",
                        "doorBellSubmitURL": "https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "purchasePaypalParams": {
                            "formAction": "https://www.sandbox.paypal.com/cgi-bin/webscr",
                            "hostedButtonId": "SYEKB94SNYBMJ",
                            "btnImgSrc": "https://www.sandbox.paypal.com/en_US/i/btn/btn_buynow_LG.gif",
                            "pixelGifSrc": "https://www.sandbox.paypal.com/en_US/i/scr/pixel.gif"
                        },
                        "zinkezWebsiteUrl": "http://zinkerz.com/toefl/",
                        "mediaEndPoint": "//dfz02hjbsqn5e.cloudfront.net/",
                        "enforceZinkerzDomainSignup": true,
                        "redirectLogout": "login.html",
                        "redirectLogin": "index.html",
                        "redirectSignup": "index.html",
                        "welcomeBackHintInDays": 5,
                        "dashboardFeatureEnabled": true,
                        "appContext": "student"
                    }
                },
                "prod": {
                    "ACT": {
                        "appName": "act-app-web",
                        "firebaseAppScopeName": "act_app",
                        "firebaseDashboardAppScopeName": "act_dashboard",
                        "fbGlobalEndPoint": "https://znk-prod.firebaseio.com/",
                        "fbDataEndPoint": "https://act-prod.firebaseio.com/",
                        "gaTrackingId": "UA-58469239-1",
                        "fbqId": "764164503681608",
                        "mixpanelId": "3e39eee637254302f18bad91ee1b126e",
                        "atatusApiKey": "f4b8d17352724009b76bbbc3cc787c09",
                        "enableAtatusLog": true,
                        "debug": false,
                        "enableAnalytics": true,
                        "segment_io_key": "",
                        "backendEndpoint": "https://znk-web-backend-prod.azurewebsites.net/",
                        "dataAuthSecret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
                        "promiseTimeOut": 15000,
                        "dreamSchoolJsonUrl": "/assets/json/dreamSchools.json",
                        "facebookAppId": "1557254871261322",
                        "googleAppId": "144375962953-mga4p9d3qrgr59hpgunm2gmvi9b5p395.apps.googleusercontent.com",
                        "doorbellApiKey": "44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "doorbellId": "3084",
                        "doorBellSubmitURL": "https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "purchasePaypalParams": {
                            "formAction": "https://www.paypal.com/cgi-bin/webscr",
                            "hostedButtonId": "4VME6XJGZPE2C",
                            "btnImgSrc": "https://www.paypalobjects.com/en_US/i/btn/btn_buynow_LG.gif",
                            "pixelGifSrc": "https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
                        },
                        "enforceZinkerzDomainSignup": false,
                        "zinkerzWebsiteBaseUrl": "//zinkerz.com/",
                        "zinkezWebsiteUrl": "//zinkerz.com/act/",
                        "actDashboardWebSiteUrl": "//www.zinkerz.com/act-educator/",
                        "mediaEndpoint": "//dfz02hjbsqn5e.cloudfront.net",
                        "videosEndPoint": "//dfz02hjbsqn5e.cloudfront.net/act_app/",
                        "redirectLogout": "//www.zinkerz.com/act",
                        "redirectLogin": "//www.zinkerz.com/act/web-app",
                        "redirectFacebook": "//www.zinkerz.com/act/web-app",
                        "redirectSignup": "//www.zinkerz.com/act/web-app",
                        "welcomeBackHintInDays": 5,
                        "dashboardFeatureEnabled": true,
                        "version": "1.0.0",
                        "appContext": "student",
                        "studentAppName": "act_app",
                        "dashboardAppName": "act_dashboard",
                        "userIdleTime": 300,
                        "idleTimeout": 0,
                        "idleKeepalive": 2,
                        "teachworksDataUrl": "teachworks",
                        "plivoUsername": "devUsrZinkerz160726161534",
                        "plivoPassword": "zinkerz$9999",
                        "supportEmail": "support@zinkerz.com"

                    },
                    "SAT": {
                        "appName": "sat-app-web",
                        "firebaseAppScopeName": "sat_app",
                        "firebaseDashboardAppScopeName": "sat_dashboard",
                        "fbGlobalEndPoint": "https://znk-prod.firebaseio.com/",
                        "fbDataEndPoint": "https://sat2-prod.firebaseio.com/",
                        "gaTrackingId": "UA-58469239-1",
                        "mixpanelId": "28227de8e407b6bd568ed2568dc9d89e",
                        "atatusApiKey": "40fc362d6f9d4f3992903abff1de259b",
                        "enableAtatusLog": true,
                        "debug": false,
                        "enableAnalytics": true,
                        "segment_io_key": "",
                        "backendEndpoint": "https://znk-web-backend-prod.azurewebsites.net/",
                        "dataAuthSecret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
                        "promiseTimeOut": 90000,
                        "dreamSchoolJsonUrl": "/assets/json/dreamSchools.json",
                        "facebookAppId": "1576342295937853",
                        "googleAppId": "1008364992567-gpi1psnhk0t41bf8jtm86kjc74c0if7c.apps.googleusercontent.com",
                        "doorbellApiKey": "44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "doorbellId": "3084",
                        "doorBellSubmitURL": "https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "purchasePaypalParams": {
                            "formAction": "https://www.paypal.com/cgi-bin/webscr",
                            "hostedButtonId": "Q5367BB38K3GW",
                            "btnImgSrc": "https://www.paypalobjects.com/en_US/i/btn/btn_buynow_LG.gif",
                            "pixelGifSrc": "https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
                        },
                        "enforceZinkerzDomainSignup": false,
                        "zinkerzWebsiteBaseUrl": "//zinkerz.com/",
                        "zinkezWebsiteUrl": "//zinkerz.com/sat/",
                        "actDashboardWebSiteUrl": "//www.zinkerz.com/sat-educator/",
                        "videosEndPoint": "//dfz02hjbsqn5e.cloudfront.net/sat_app/",
                        "redirectLogout": "//www.zinkerz.com/sat",
                        "redirectLogin": "//www.zinkerz.com/sat/web-app",
                        "redirectFacebook": "//www.zinkerz.com/sat/web-app",
                        "redirectSignup": "//www.zinkerz.com/sat/web-app",
                        "welcomeBackHintInDays": 5,
                        "dashboardFeatureEnabled": true,
                        "version": "1.0.0",
                        "appContext": "student",
                        "studentAppName": "sat_app",
                        "dashboardAppName": "sat_dashboard",
                        "userIdleTime": 300,
                        "idleTimeout": 0,
                        "idleKeepalive": 2,
                        "teachworksDataUrl": "teachworks",
                        "plivoUsername": "devUsrZinkerz160726161534",
                        "plivoPassword": "zinkerz$9999",
                        "mediaEndpoint": "//dfz02hjbsqn5e.cloudfront.net",
                        "supportEmail": "support@zinkerz.com"
                    },
                    "TOEFL": {
                        "firebaseAppScopeName": "toefl_app",
                        "firebaseDashboardAppScopeName": "toefl_dashboard",
                        "fbGlobalEndPoint": "https://znk-prod.firebaseio.com/",
                        "fbDataEndPoint": "https://znk-toefl-prod.firebaseio.com/",
                        "gaTrackingId": "UA-58469239-1",
                        "mixpanelId": "3e39eee637254302f18bad91ee1b126e",
                        "atatusApiKey": "1508adeab6834bf4b56ab9b209aa2d4b",
                        "enableAtatusLog": true,
                        "debug": false,
                        "enableAnalytics": true,
                        "segment_io_key": "",
                        "backendEndpoint": "https://znk-web-backend-prod.azurewebsites.net/",
                        "dataAuthSecret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
                        "promiseTimeOut": 15000,
                        "dreamSchoolJsonUrl": "/assets/json/dreamSchools.json",
                        "facebookAppId": "1557254871261322",
                        "googleAppId": "144375962953-mga4p9d3qrgr59hpgunm2gmvi9b5p395.apps.googleusercontent.com",
                        "doorbellApiKey": "44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "doorbellId": "3084",
                        "doorBellSubmitURL": "https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D",
                        "purchasePaypalParams": {
                            "formAction": "https://www.paypal.com/cgi-bin/webscr",
                            "hostedButtonId": "KUZRR3N5W5ALE",
                            "btnImgSrc": "https://www.paypalobjects.com/en_US/i/btn/btn_buynow_LG.gif",
                            "pixelGifSrc": "https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
                        },
                        "enforceZinkerzDomainSignup": false,
                        "zinkezWebsiteUrl": "http://zinkerz.com/toefl/",
                        "mediaEndPoint": "//dfz02hjbsqn5e.cloudfront.net/",
                        "videosEndPoint": "//dfz02hjbsqn5e.cloudfront.net/toefl_app/",
                        "redirectLogout": "//www.zinkerz.com/toefl",
                        "redirectLogin": "//www.zinkerz.com/toefl/web-app",
                        "redirectFacebook": "//www.zinkerz.com/toefl/web-app",
                        "redirectSignup": "//www.zinkerz.com/toefl/web-app",
                        "welcomeBackHintInDays": 5,
                        "dashboardFeatureEnabled": false,
                        "appContext": "student"
                    }
                }
            };
            return JSON.parse(JSON.stringify(allEnvJson));
        }

        this.$get = function () {
            var AllEnvConfigObj = {
                dev: allEnvObj.dev,
                prod: allEnvObj.prod
            };
            return AllEnvConfigObj;
        }
    });
