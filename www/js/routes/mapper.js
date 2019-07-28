app.config(function($urlRouterProvider, $locationProvider, $stateProvider, localStorageServiceProvider, paginationTemplateProvider, $httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;
    localStorageServiceProvider.setPrefix('Mapper');
    // paginationTemplateProvider.setPath('views/manage/pagination.tpl.html');
    // $locationProvider.html5Mode(true);
    $stateProvider
    .state({
        name: "mapFinder",
        url: "/",
        templateUrl: "./views/mapFinder.tpl.html",
        controller: "mapFinderController",
        controllerAs: "mfc"
    })
    .state({
        name: "setup",
        url: "/setup",
        templateUrl: "./views/setup/home.tpl.html",
        controller: "setupController",
        controllerAs: "sc"
    })
    .state({
        name: "login",
        url: "/login",
        templateUrl: "./views/setup/login.tpl.html",
        controller: "loginController",
        controllerAs: "lC"
    })
    .state({
        name: "manage",
        url: "/manage",
        templateUrl: "./views/manage/home.tpl.html",
        controller: "manageController",
        controllerAs: "mc"
    })
    .state({
        name: "viewMap",
        url: "/map/:id",
        templateUrl: "./views/viewMap.tpl.html",
        controller: "viewMapController",
        controllerAS: "vmc"
    })
    .state({
        name: "addMap",
        url: "/manage/add",
        templateUrl: "./views/manage/add.tpl.html",
        controller: "addMapController",
        controllerAs: "amc"
    })

    .state({
        name: "preferences",
        url: "/preferences",
        templateUrl: "./views/preferences/abstract.tpl.html",
        controller: "preferencesController",
        controllerAs: "pc",
        abstract: true
    })
    .state({
        name: "preferences.history",
        url: "/history",
        templateUrl: "./views/preferences/history.tpl.html",
        controller: "recentListController",
        controllerAs: "rlc"
    })
    .state({
        name: "preferences.favourites",
        url: "/favourites",
        templateUrl: "./views/preferences/favourites.tpl.html",
        controller: "favouritesController",
        controllerAs: "fc"
    })
    .state({
        name: "editMap",
        url: "/editMap/:id",
        templateUrl: "./views/manage/edit.tpl.html",
        controller: "editMapController",
        controllerAs: "emc"
    })

    $urlRouterProvider.otherwise('/'); //default route
});

app.factory('tokenAttachment', function($rootScope, $q, authService) {
    var sessionInjector = {
        request: function(config) {
            var token = authService.getToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers['tabletToken'] = token;
            }

            return config;
        }
    };
    return sessionInjector;
});

app.config([
    '$httpProvider',
    function($httpProvider) {
        $httpProvider.interceptors.push('tokenAttachment');
    }
]);
