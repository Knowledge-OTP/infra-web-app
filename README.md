## Testing

In order to run the tests run 'grunt test'

## Important

The dist directory is the package content when used as a dependency used by other apps, so remember to run 'grunt build'

## Repo structure

## Localization
    each component has its own locale file, this file loads via $translatePartialLoaderProvider.addPart
    so make sure to declare $translatePartialLoader i.e: $translateProvider.useLoader('$translatePartialLoader', {
                                                            urlTemplate: '/i18n/{part}/{lang}.json'
                                                         });
    and adding the following run block:   $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                                            $translate.refresh();
                                          });
    and copy the locale files accrodingly.
    for more info about this translation feature (look for using partialLoader part): https://angular-translate.github.io/docs/#/guide/12_asynchronous-loading
     

