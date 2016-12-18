(function(angular) {

    angular.module('demo', ['znk.infra-web-app.aws'])
        .controller('Main', function ($scope, AwsSrv) {

            var awsS3 = AwsSrv.newAwsS3();

            $scope.uploadFile = function() {
                var file = document.querySelector('input[type=file]');
                var fileValue = file.value;
                if (fileValue && fileValue !== '') {
                    var fileData = file.files[0];
                    awsS3.upload({
                        file: fileData,
                        prefixPath: 'user-uploads' 
                    }).then(function(data) {
                        console.log('data', data);
                    }).catch(function(err) {
                        console.log('err', err);
                    });
                }

            };
        }).constant('ENV', {
             appName: 'toefl_app'
        });
})(angular);
