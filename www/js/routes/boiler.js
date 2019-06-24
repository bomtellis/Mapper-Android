// States for the gen reset section
app.config(function($stateProvider) {
    $stateProvider
    .state({
        name: "boilers",
        url: "/boilers/",
        templateUrl: "./views/boilers/abstract.tpl.html",
        controller: 'boilerMasterController',
        controllerAs: 'bmc',
        abstract: true
    })
    .state({
        name: "boilers.home",
        url: "home",
        templateUrl: "./views/boilers/home.tpl.html",
        controller: 'boilerHomeController',
        controllerAs: 'bC'
    })

    .state({
        name: "boilers.create",
        url: "create",
        templateUrl: "./views/boilers/create.tpl.html",
        controller: 'boilerCheckCreateController',
        controllerAs: 'bCCC'
    })
    .state({
        name: "boilers.graphs",
        url: "graphs",
        templateUrl: "./views/boilers/graphs.tpl.html",
        controller: 'boilerGraphController',
        controllerAs: 'bCCC'
    })
    .state({
        name: "boilers.1",
        url: "one",
        templateUrl: "./views/boilers/test.tpl.html",
        controller: 'boilerCheckController',
        controllerAs: 'bC',
        params: {
            boilerNumber: 1,
            editing: false
        }
    })
    .state({
        name: "boilers.2",
        url: "two",
        templateUrl: "./views/boilers/test.tpl.html",
        controller: 'boilerCheckController',
        controllerAs: 'bC',
        params: {
            boilerNumber: 2,
            editing: false
        }
    })
    .state({
        name: "boilers.3",
        url: "three",
        templateUrl: "./views/boilers/test.tpl.html",
        controller: 'boilerCheckController',
        controllerAs: 'bC',
        params: {
            boilerNumber: 3,
            editing: false
        }
    })
    .state({
        name: "boilers.finished",
        url: "finished",
        templateUrl: "./views/boilers/finished.tpl.html",
        controller: 'boilerFinishedController',
        controllerAs: 'bFC'
    })
});
