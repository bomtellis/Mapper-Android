// States for the gen reset section
app.config(function($stateProvider) {
    $stateProvider
    .state({
        name: "genTest",
        url: "/genTest",
        templateUrl: "./views/generatorTest/abstract.tpl.html",
        abstract: true
    })
    .state({
        name: "genTest.home",
        url: "/home",
        templateUrl: "./views/generatorTest/home.tpl.html",
        controller: "generatorTestController",
        controllerAs: "gtc",
    })
    .state({
        name: "genTest.status",
        url: "/status",
        templateUrl: "./views/generatorTest/status.tpl.html"
    })
    .state({
        name: "genTest.chpStatus",
        url: "/chpStatus",
        templateUrl: "./views/generatorTest/chpStatus.tpl.html"
    })
    .state({
        name: "emergencyResets",
        url: "/emergencyResets",
        templateUrl: "./views/emergencyResets/home.tpl.html",
        controller: "emergencyResetsController",
        controllerAs: "erc"
    })
});
