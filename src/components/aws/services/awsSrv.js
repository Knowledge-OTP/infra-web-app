(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.aws').service('AwsSrv',
        function (ENV, $log, $q, UtilitySrv, $window) {
            'ngInject';

         function _updateAwsConfig(config, options) {
            options = options || {}; 
            config = config || false;

            if (!config) {
               config = {
                   region: options.region || ENV.s3Region || 'us-east-1',
                   credentials: new AWS.CognitoIdentityCredentials({
                       IdentityPoolId: options.IdentityPoolId || ENV.IdentityPoolId || 'us-east-1:d356a336-de8a-48c7-b67f-65c634462529'
                   }),
               };
            } 

            $window.AWS.config.update(config);
         }  

         function _init() {
              _updateAwsConfig();
         }   
           
         _init();

          function _generateFileName() {
             return UtilitySrv.general.createGuid();  
          } 

          function _getFile(blob, fileName) {
              return new $window.File([blob], fileName);
          }

          function _addSlashToPath(prefixPath) {
              var prefixPathLength = prefixPath.length;

              var lastChar = prefixPath.substring(prefixPathLength - 1, prefixPathLength); 

              if (lastChar === '/') {
                  return prefixPath;
              }

              return prefixPath + '/';
          }

          function _getFilePath(prefixPath, file) {
             return _addSlashToPath(prefixPath) + file.name;
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

              this.bucketName = options.bucketName || ENV.s3InMedieBucketName || 'inmedia.zinkerz.com';

              this.filesNames = [];

              this.bucketInstance = new $window.AWS.S3({ 
                   params: {
                      Bucket: this.bucketName
                   }
              });
          }
         
        AwsS3.prototype.upload = function(options) {
            var deferred = $q.defer();
            var errMsg;
            var self = this;

            if (!angular.isObject(options) || angular.isArray(options)) {
                  errMsg = 'AwsSrv AwsS3 upload: options must be an object!! ie: { blob: blob}';
                  $log.error(errMsg);
                  deferred.reject(errMsg);
                  return;
            }

            var blobOption = options.blob;
            var fileOption = options.file;

            if (!blobOption && !fileOption) {
                  errMsg = 'AwsSrv AwsS3 upload: options must contian blob or file option!';
                  $log.error(errMsg);
                  deferred.reject(errMsg);
                  return;
            }
            
            var fileName = blobOption ? _generateFileName() + '.' + (options.ext || 'mp3')  : fileOption.name;
            var file = blobOption ? _getFile(blobOption, fileName) : fileOption;
            var filePath = _getFilePath(options.prefixPath, file);

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
                     self.filesNames.push(fileName);

                     deferred.resolve(data);
                }
            });

            return deferred.promise;
        };  

        AwsS3.prototype.getCurrentFileName = function() {
            var filesLength = this.filesNames.length;

            if (filesLength) {
                return this.filesNames[filesLength - 1];
            }

            return false;
        };

        this.updateConfig = updateConfig;

        // factory for aws bucket instances 
        this.newAwsS3 = function (options) {
            return new AwsS3(options);   
        };

      }
    );
})(angular);
