## Testing

In order to run the tests run 'grunt test'

## Important

The dist directory is the package content when used as a dependency used by other apps, so remember to run 'grunt build'

## Repo structure

## Localization
    each component has its own locale file, this file loads via  $translateProvider.useStaticFilesLoader({
                                                                        prefix: 'app/',
                                                                        suffix: '.json'
                                                                  });
You need to include <script src="infra/demoShared/translate.config.js"></script> in the demo/index.html.
     
## You must provide locale for the following keys:
    under "SUBJECTS" provide all subject ids translations, i.e:
        "SUBJECTS":{
            "0": "math",
            "1": "reading",
            "2": "writing"
        }

## svg icon for all the subject should be set, i.e if one of the subejct is math then math-icon svg should be set

## colors for subjects should be set for example, 'reading-bg'.
