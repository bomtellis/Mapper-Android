app.config(function($urlRouterProvider, $locationProvider, $stateProvider, localStorageServiceProvider, paginationTemplateProvider) {
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
        name: "recentList",
        url: "/recent",
        templateUrl: "./views/recent.tpl.html",
        controller: "recentListController",
        controllerAs: "rlc"
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
