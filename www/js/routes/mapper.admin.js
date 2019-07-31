app.config(function($stateProvider)
{
    $stateProvider
    .state({
        name: "admin",
        url: "/admin",
        templateUrl: "./views/admin/abstract.tpl.html",
        controller: function(){},
        abstract: true
    })
    .state({
        name: "admin.home",
        url: "/home",
        templateUrl: "./views/admin/home.tpl.html",
        controller: 'admin.home',
        controllerAs: 'AH'
    })
    .state({
        name: "admin.users",
        url: "/users",
        templateUrl: "./views/admin/users.tpl.html",
        controller: 'admin.users',
        controllerAs: 'AU'
    })
    .state({
        name: "admin.create",
        url: "/users/create",
        templateUrl: "./views/admin/create.user.tpl.html",
        controller: 'admin.create',
        controllerAs: 'AC'
    })
    .state({
        name: "admin.changePassword",
        url: "/users/password/:id",
        params: {
            userData: {
                object: true,
                hiddenParam: true
            }
        },
        templateUrl: "./views/admin/changePassword.tpl.html",
        controller: 'admin.changePassword',
        controllerAs: 'ACP'
    })
    .state({
        name: "admin.changeRole",
        url: "/users/role/:id",
        params: {
            userData: {
                object: true,
                hiddenParam: true
            }
        },
        templateUrl: "./views/admin/changeRole.tpl.html",
        controller: 'admin.changeRole',
        controllerAs: 'ACR'
    })
    .state({
        name: "admin.keys",
        url: "/keys",
        templateUrl: "./views/admin/keys.tpl.html",
        controller: 'admin.keys',
        controllerAs: 'AK'
    })
})
