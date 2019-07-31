var app = angular.module('Mapper', [
    'ui.router',
    'ui-leaflet',
    'ui.bootstrap',
    'LocalStorageModule',
    'ngWebSocket',
    'angularUtils.directives.dirPagination',
    'ng-showdown',
    'rzSlider',
    'ngToast'
]);

app.run(function(localStorageService, $state, $timeout, $rootScope, $http, configService, mapService, loginService, authService, $window)
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
                protocol: "http://",
                domain: "a domain",
                port: 8090,
                persistence: true,
                experimental: false,
                noauth: false
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

                // no auth
                if($rootScope.config.noauth !== true)
                {
                    // if persistence is set check the token
                    if($rootScope.config.persistence == true)
                    {
                        // get the token

                        $http.get(config.apiUrl + "api/token/verify").then(function successCallback(data)
                        {
                            if(data.data.message !== "Valid")
                            {
                                $state.go('login');
                            }
                            // else
                            // {
                            //     $state.go('mapFinder');
                            // }
                        }, function()
                        {
                            // error
                            $state.go('login');
                        });
                    }
                    else
                    {
                        loginService.session().then(function(data)
                        {
                            $rootScope.permissionLevel = JSON.parse($window.sessionStorage.getItem("permissionLevel"));
                        }, function(err, data)
                        {
                            $rootScope.permissionLevel = 1;
                            $timeout(function()
                            {
                                $state.go('login');
                            },20)
                        });
                    }
                }
                else
                {
                    $rootScope.permissionLevel = 3;
                }

                if($rootScope.config.experimental == true)
                {
                    $rootScope.experimental = true;
                }
                else
                {
                    $rootScope.experimental = false;
                }
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
        }
        else
        {
            $rootScope.favourites = [];
        }

    }
});

app.filter('prettyJSON', function () {
    function prettyPrintJson(json) {
      return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
    }
    return prettyPrintJson;
});
