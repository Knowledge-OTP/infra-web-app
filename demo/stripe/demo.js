(function(angular) {

    angular.module('demo', [
        'znk.infra.auth',
        'znk.infra.popUp',
        'pascalprecht.translate',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.stripe'])
        .config(function () {
            // Replace storageConfig parameters through localStorage
            localStorage.setItem('email', 'ofir+edu@zinkerz.com');
            localStorage.setItem('password', '123123');
            localStorage.setItem('dataDbPath', 'https://act-dev.firebaseio.com/');
            localStorage.setItem('studentPath', '/act_app');
            localStorage.setItem('teacherPath', '/act_dashboard');
        })
        .decorator('AuthService', function ($delegate) {
            'ngInject';
            $delegate.getAuth = function () {
                return new Promise(resolve => resolve({uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540'}));
            };
            return $delegate;
        })
        .value('ENV',  {
            znkBackendBaseUrl: 'https://dev-api.zinkerz.com',
            stripeToken: 'pk_test_VCX5a5aw64Z8WbB811quSQMj'
        })
        .controller('Main', function ($scope, StripeService) {
            $scope.openPopup = () => {
                const amount = '20';
                const name = 'Zinkerz';
                const description = 'Instance Payment Description';
                StripeService.openStripeModal(amount, name, description)
                    .then(result => console.log('result : ', result));
            };
        });
})(angular);
