(function (angular, AWS) {
    'use strict';

    angular.module('znk.infra-web-app.aws').service('AwsSrv',
        function (ENV, $log, $q, UtilitySrv) {
            'ngInject';

         function _updateAwsConfig(options, _config) {
            options = options || {}; 

            var config = _config || {};

            if (!AWS.config) {
               config = {
                   region: options.region || ENV.s3Region || 'us-east-1',
                   credentials: new AWS.CognitoIdentityCredentials({
                       IdentityPoolId: options.IdentityPoolId || ENV.IdentityPoolId || 'us-east-1_C3pCDpyrz'
                   }),
               };
            } 

            AWS.config.update(config);
         }  

         function _init() {
              _updateAwsConfig();
         }   
           
         _init();

          function _generateFileName() {
             return UtilitySrv.general.createGuid();  
          } 

          function _getFile(blob) {
              return new File([blob], filename);
          }

          function _getFilePath(file) {
             return ENV.appName + '/' + file.name;
          }

          function updateConfig(options, config) {
              _updateAwsConfig(options, config);
          }

          function AwsS3(options) {
              options = options || {};

              if (!angular.isObject(options) || angular.isArray(options)) {
                  $log.error('AwsSrv Bucket newS3: options must be an object!!');
                  return;
              }

              this.bucketName = options.bucketName || ENV.s3InMedieBucketName || 'inmedia.zinkerz.com.s3-website-eu-west-1.amazonaws.com';

              this.bucketInstance = new AWS.S3({ 
                   params: {
                      Bucket: this.bucketName
                   }
              });
          }
         
        AwsS3.prototype.upload = function(options) {
            if (!angular.isObject(options) || angular.isArray(options)) {
                  $log.error('AwsSrv AwsS3 upload: options must be an object!! ie: { blob: blob}');
                  return;
            }

            var blobOption = options.blob;
            var fileOption = options.file;

            if (!blobOption || !fileOption) {
                  $log.error('AwsSrv AwsS3 upload: options must contian blob or file option!');
                  return;
            }
            
            var deferred = $q.defer();
            var fileName = _generateFileName();
            var file = blobOption ? _getFile(blobOption, filename) : fileOption;
            var filePath = _getFilePath(file);

            var params = {
                Key: filePath,
                ContentType: file.type,
                Body: file,
                ACL: options.ACL || 'public-read'
            };

            this.bucketInstance.putObject(params, function(err, data) {
                if (err) {
                     deferred.reject(err);
                } else {
                     deferred.resolve(data);
                }
            });

            return deferred.promise;
        };  

        this.updateConfig = updateConfig;

        // factory for aws bucket instances 
        this.newAwsS3 = function (options) {
            return new AwsS3(options);   
        };

      }
    );
})(angular, AWS);
