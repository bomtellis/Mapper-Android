var app = angular.module('Mapper', [
    'ui.router',
    'ui-leaflet',
    'ui.bootstrap',
    'LocalStorageModule',
    'ngWebSocket',
    'angularUtils.directives.dirPagination',
    'ng-showdown',
    'rzSlider'
]);

app.run(function(localStorageService, $state, $timeout, $rootScope, configService, mapService)
{
    $rootScope.errorLoading = false;
    $rootScope.checkedServer = false;

    if(localStorageService.isSupported)
    {
        let item = configService.status();
        let recentStatus = mapService.status();
        let favouriteStatus = mapService.favouriteStatus();

        if(item !== true)
        {
            $timeout(function()
            {
                $state.go('setup');
            },20)

            $rootScope.config = {
                apiUrl: "test url"
            }
        }
        else if(item === true)
        {
            let config = configService.getConfig();
            $rootScope.config = config;
            let checkserver = configService.init();
            checkserver.then(function successCallback()
            {
                $rootScope.errorLoading = false;
                $rootScope.checkedServer = true;
            }, function errorCallback()
            {
                // bad connection send to setup to check
                $timeout(function()
                {
                    $state.go('setup');
                },20)
            });
        }

        // recently viewed
        if(recentStatus === true)
        {
            let recentList = mapService.getRecents();
            $rootScope.recentList = recentList;
        }
        else
        {
            // init empty array
            $rootScope.recentList = [];
        }

        // favourites
        if(favouriteStatus == true)
        {
            let favouriteList = mapService.getFavourites();
            $rootScope.favourites = favouriteList;
            console.log($rootScope.favourites);
        }
        else
        {
            $rootScope.favourites = [];
            console.log($rootScope.favourites);
        }

    }
});

app.filter('prettyJSON', function () {
    function prettyPrintJson(json) {
      return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
    }
    return prettyPrintJson;
});
