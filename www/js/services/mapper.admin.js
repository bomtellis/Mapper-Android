app.service('adminService', function($http, $rootScope)
{
    this.stats = function()
    {
        return $http.get($rootScope.config.apiUrl + "api/admin/stats");
    }

    this.users = function()
    {
        return $http.get($rootScope.config.apiUrl + "api/admin/users");
    };

    this.keys = function()
    {
        return $http.get($rootScope.config.apiUrl + "api/admin/keys");
    }

    this.createUser = function(formModel)
    {
        return $http.post($rootScope.config.apiUrl + "api/admin/user/create", formModel);
    }

    this.fetchUser = function(id)
    {
        return $http.get($rootScope.config.apiUrl + "api/admin/user/" + id);
    }

    this.changeRole = function(obj)
    {
        return $http.post($rootScope.config.apiUrl + "api/admin/user/changeRole", obj);
    }

    this.changePassword = function(obj)
    {
        return $http.post($rootScope.config.apiUrl + "api/admin/user/changePassword", obj);
    }

    this.toggleActive = function(id, active)
    {
        return $http.post($rootScope.config.apiUrl + "api/admin/user/toggleActive/" + id, {active: active});
    }

    this.deleteUser = function(id)
    {
        return $http.get($rootScope.config.apiUrl + "api/admin/user/delete/" + id);
    }

    this.revokeToken = function(tokenId)
    {
        return $http.post($rootScope.config.apiUrl + "api/admin/revokeToken", {id: tokenId});
    }
});
