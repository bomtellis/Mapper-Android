app.controller('MapperController', ['$rootScope', '$scope', function($rootScope, $scope) {
    var that = this;
    that.error = $rootScope.errorLoading;
    that.loading = $rootScope.checkedServer;
    that.permissionLevel = $rootScope.permissionLevel;
    that.experimental = $rootScope.config.experimental;

    $rootScope.$watch('permissionLevel', function(value)
    {
        console.log('Changed to: ' + value);
        that.permissionLevel = value;

    });

    $rootScope.$watch('experimental', function(value)
    {
        that.experimental = value;
    });
}]);

app.controller('mapFinderController', ['mapService', '$state', function(mapService, $state)
{
    var that = this;
    mapService.getVisibleMaps().then(function successCallback(data)
    {
        that.mapData = data.data;
    }, function()
    {
        $state.go('login');
    });

    this.selectTypeAhead = function(input)
    {
        mapService.addToRecents(input);

        $state.go('viewMap', {
            id: input._id
        })
    }

}]);

app.controller('viewMapController', ['mapService', '$stateParams', 'leafletData', 'leafletBoundsHelpers', '$scope', '$timeout', '$rootScope', function(mapService, $stateParams, leafletData, leafletBoundsHelpers, $scope, $timeout, $rootScope)
{
    var that = this;
    $scope.loading = true;
    $scope.favourite = false;

    $scope.$watch("loaded", function(value)
    {
        if(value === true)
        {
            leafletData.getMap().then(function(map)
            {
                $timeout(function()
                {
                    map.invalidateSize();
                }, 300);
            })
        }
    });

    $scope.loaded = false;

    // get the id
    this.id = $stateParams.id;

    var maxBounds = leafletBoundsHelpers.createBoundsFromArray([
        [0, 5792],
        [8192, 0]
    ]);

    angular.extend($scope, {
        defaults: {
            crs: 'Simple',
            maxZoom: 4,
            minZoom: 0
        },
        center: {
            lat: -400,
            lng: 400,
            zoom: 1
        },
        maxBounds: maxBounds,
        layers: {
            baselayers: {}
        }
    });

    mapService.getMap(this.id).then(function successCallback(data)
    {
        that.mapData = data.data;
        mapService.checkFavourite(data.data).then(function()
        {
            console.log('it is');
            $scope.favourite = true;
        },
        function()
        {
            console.log('it isnt');
            $scope.favourite = false;
        });

        angular.extend($scope, {
            layers: {
                baselayers: {
                    outline: {
                        name: data.data.mapName,
                        type: 'xyz',
                        url: $rootScope.config.apiUrl + "maps/" + data.data._id + "/{z}/map_tile_{x}_{y}.png",
                        bounds: [
                            [0, 5792],
                            [8192, 0]
                        ],
                        layerParams: {
                            noWrap: true
                        }
                    }
                }
            }
        })

        $scope.loaded = true;
        $timeout(function()
        {
            $scope.loading = false;
        }, 400);
    });

    // toggle Favourite
    $scope.toggleFavourite = function()
    {
        console.log('Toggle');
        mapService.checkFavourite(that.mapData).then(function(map)
        {
            // is a favourite
            mapService.removeFavourite(map);
        },
        function(map)
        {
            // is not a favourite
            mapService.addFavourite(map);
        });

        $scope.favourite = !$scope.favourite;
    }

}]);

app.controller('addMapController', ['$http', '$state', '$rootScope', '$websocket', '$timeout', function($http, $state, $rootScope, $websocket, $timeout)
{
    var that = this;
    this.loading = false;

    that.go = function(formModel, file)
    {
        that.loading = true;

        var fd = new FormData();
        fd.append('uploadedFile', file);
        fd.append('mapName', formModel.mapName);
        fd.append('description', formModel.description);
        $http.post($rootScope.config.apiUrl + "api/maps/", fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function successCallback(data)
        {
            var socket = $websocket($rootScope.config.wsProtocol + $rootScope.config.domain + ":" +$rootScope.config.port + "/api/maps/");

            socket.send(JSON.stringify({
                action: "add.refresh"
            }));

            socket.onMessage(function(message)
            {
                let msg = JSON.parse(message.data);
                if(msg.action == "refresh")
                {
                    that.loading = false;
                    socket.close();
                    $state.go('manage');
                }
            });

            // Backup if websockets fail
            $timeout(function()
            {
                // backup
                if(that.loading === true)
                {
                    socket.close();
                    $state.go('manage');
                }
            }, 80000);
        }, function errorCallback()
        {

        })
    };
}]);

// handles setup functions
app.controller('setupController', ['configService', '$rootScope', '$state', '$timeout', 'loginService', '$uibModal', 'ngToast', 'authService', '$window',
function(configService, $rootScope, $state, $timeout, loginService, $uibModal, ngToast, authService, $window)
{
    var that = this;
    that.loading = false;

    if($rootScope.checkedServer == false)
    {
        that.error = true;
    }

    // get existing config if possible
    that.status = configService.status();
    if(that.status === true)
    {
        that.config = configService.getConfig();
        that.formModel = this.config;
    }
    else
    {
        // no config - show hardcoded
        that.config = $rootScope.config;
    }

    // handles form submit
    this.go = function(formModel)
    {
        that.loading = true; // loading splash
        that.error = false; // error alert

        let apiUrl = formModel.protocol + formModel.domain + ':' + formModel.port + '/';
        $rootScope.config =
        {
            protocol: formModel.protocol,
            domain: formModel.domain,
            port: formModel.port,
            apiUrl: apiUrl,
            persistence: formModel.persistence,
            experimental: formModel.experimental,
            noauth: formModel.noauth
        };

        // if no auth is set disable persistence
        $rootScope.config.noauth == true ? $rootScope.config.persistence = false : $rootScope.config.persistence;

        configService.setup($rootScope.config).then(function()
        {
            // resolve
            $rootScope.checkedServer = true;

            // if config already exists
            if(that.status == true)
            {
                // config exists and persistence is now false
                if($rootScope.config.persistence == false)
                {
                    // remove old token
                    loginService.removeLocalToken();
                }
                else
                {
                    loginService.affirmLocalToken();
                }

                if($rootScope.config.noauth == true)
                {
                    // remove old token
                    loginService.removeLocalToken();
                }
                else
                {
                    loginService.affirmLocalToken();
                }
            }


            if($rootScope.config.noauth == true)
            {
                // if no auth is true
                // permissions to max
                that.loading = false;
                $rootScope.permissionLevel = 3;
                $state.go('mapFinder');
            }
            else
            {
                if($rootScope.config.persistence == true)
                {
                    if(typeof authService.getToken() == null)
                    {
                        //try to get token
                        loginService.tryToken().then(function(data)
                        {
                            console.log('got a token');
                            configService.setupToken(data.data);
                            $state.go('mapFinder');
                        }, function()
                        {
                            console.log('291');
                            $state.go('login');
                        })
                    }
                    else
                    {
                        // check the token
                        loginService.verifyToken().then(function()
                        {
                            that.loading = false;
                            $state.go('mapFinder');
                        },
                        function()
                        {
                            loginService.session().then(function()
                            {
                                that.loading = false;
                                // get new token
                                loginService.tryToken().then(function(data)
                                {
                                    console.log('got a token 311');
                                    configService.setupToken(data.data);
                                    $state.go('mapFinder');
                                }, function()
                                {
                                    console.log('316');
                                    $state.go('login');
                                })
                            }, function()
                            {
                                that.loading = false;
                                console.log('312');
                                $state.go('login');
                            });
                        });
                    }
                }
                else
                {

                    loginService.session().then(function()
                    {
                        $rootScope.permissionLevel = JSON.parse($window.sessionStorage.getItem("permissionLevel"));
                        that.loading = false;
                        $state.go('mapFinder');
                    }, function()
                    {
                        $rootScope.permissionLevel = 1;
                        that.loading = false;
                        console.log('320');
                        $state.go('login');
                    });
                }
            }

            $rootScope.experimental = $rootScope.config.experimental;
        },

        function()
        {
            // reject
            that.loading = false; // hide loading
            $timeout(function()
            {
                that.error = true; // show error
            }, 800);
        });
    }

    this.reset = function()
    {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "./views/modals/reset.tpl.html",
          controller: "resetModalController",
          controllerAs: 'rmc',
          size: "md"
        });

        modalInstance.result.then(function (decision) {
            if(decision === true)
            {
                ngToast.create({
                    className: "info",
                    timeout: 5000,
                    content: "Reset all settings to default",
                    dismissButton: true
                })
                // logout session
                loginService.logout();
                // remove token
                loginService.removeToken();
                // flatten settings
                configService.reset();
                that.loading = true;
                $state.reload();
            }
        }, function () {
            console.log('no reset');
        });
    };

    this.logout = function()
    {
        loginService.logout().then(function(data)
        {
            ngToast.create({
                className: "info",
                timeout: 5000,
                content: data.data.message,
                dismissButton: true
            })
        }, function(data)
        {
            ngToast.create({
                className: "info",
                timeout: 5000,
                content: "Unable to log you out",
                dismissButton: true
            })
        });

    }

    this.token = function()
    {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "./views/modals/token.tpl.html",
          controller: "tokenModalController",
          controllerAs: 'tmc',
          size: "md"
        });

        modalInstance.result.then(function (decision) {
            if(decision === true)
            {
                // token has been removed
                that.loading = true;
                ngToast.create({
                    className: "info",
                    timeout: 5000,
                    content: "Token deleted successfully",
                    dismissButton: true
                })
                $state.reload();
            }
        }, function () {
            console.log('no reset');
        });
    }

    this.session = function()
    {
        loginService.session().then(function(data)
        {

            var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: "./views/modals/session.tpl.html",
              controller: "sessionModalController",
              controllerAs: 'rmc',
              size: "md",
              resolve: {
                  data: function() {return data;},
                  status: function() { return true; }
              }
            });

            modalInstance.result.then(function (decision) {
            }, function () {
            });
        }, function()
        {
            let error = {
                message: "User is not logged in",
                status: "Invalid"
            }
            var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: "./views/modals/session.tpl.html",
              controller: "sessionModalController",
              controllerAs: 'rmc',
              size: "md",
              resolve: {
                  data: function() {return error;},
                  status: function() { return false; }
              }
            });

            modalInstance.result.then(function (decision) {
            }, function () {
            });
        });
    }
}]);

app.controller('loginController', ['loginService', '$timeout', '$state', '$rootScope', '$window', function(loginService, $timeout, $state, $rootScope, $window)
{
    var that = this;
    that.loginError = false;
    that.tokenError = false;
    that.loading = false;

    that.go = function(data)
    {
        that.loading = true;
        loginService.login(data).then(function successCallback(output)
        {
            $rootScope.permissionLevel = output.data.permissionLevel;
            $window.sessionStorage.setItem("permissionLevel", $rootScope.permissionLevel);
            $timeout(function()
            {
                that.loading = false;
                $state.go('mapFinder');
            }, 500);

        }, function errorCallback(err)
        {
            if(err == "token")
            {
                that.loading = false;
                that.tokenError = true;
                $timeout(function()
                {
                    that.tokenError = false;
                }, 5000);
            }

            if(err == "login")
            {
                that.loading = false;
                that.loginError = true;
                $timeout(function()
                {
                    that.loginError = false;
                }, 5000);
            }
        });
    };
}]);

app.controller('preferencesController', ['$uibModal', 'mapService', '$state', function($uibModal, mapService, $state)
{

}]);

app.controller('recentListController', ['$rootScope', '$uibModal', 'mapService', '$state', function($rootScope, $uibModal, mapService, $state)
{
    var that = this;
    that.items = $rootScope.recentList;

    this.clear = function () {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "./views/modals/confirm.tpl.html",
          controller: "confirmModalController",
          controllerAs: 'cmc',
          size: "sm"
        });

        modalInstance.result.then(function (decision) {
            mapService.clearRecents().then(function()
            {
                $state.reload();
            })
        }, function () {
            console.log('no delete');
        });
      };
}]);

app.controller('favouritesController', ['$rootScope', 'mapService', '$uibModal', function($rootScope, mapService, $uibModal)
{
    var that = this;
    that.items = $rootScope.favourites;

    that.remove = function(map)
    {
        mapService.removeFavourite(map);
    }

    that.rename = function(map)
    {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "./views/modals/rename.tpl.html",
          controller: "renameModalController",
          controllerAs: 'rmc',
          backdrop: "static",
          size: "md",
          resolve: {
              map: map
          }
        });

        modalInstance.result.then(function (data) {
            if(data.status === true)
            {
                map.mapName = data.name;
                mapService.syncFavourites();
            }
        }, function () {
            console.log('no delete');
        });
    }

}]);

app.controller('manageController', ['mapService', '$state', '$uibModal', '$stateParams', 'anchorSmoothScroll', '$location', function(mapService, $state, $uibModal, $stateParams, anchorSmoothScroll, $location)
{
    var that = this;
    that.loading = true;

    // get all maps
    mapService.getAllMaps().then(function successCallback(data)
    {
        that.loading = false;
        that.items = data.data;
    }, function()
    {
        $state.go('login');
    });

    this.pageUpdate = function()
    {
        $location.hash('top');
        anchorSmoothScroll.scrollTo('top');
    };

    // edit map data
    this.hide = function(map)
    {
        var mapData = map;
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "./views/modals/hide.tpl.html",
          controller: "hideModalController",
          controllerAs: 'hmc',
          size: "md",
          resolve: {
              map: mapData
          }
        });

        modalInstance.result.then(function (decision) {
            if(decision === true)
            {
                mapData.hidden = !mapData.hidden;
                mapService.updateMap(mapData, null);
            }
        }, function () {
            console.log('no delete');
        });

    };

    // remove map
    this.remove = function(map)
    {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "./views/modals/delete.tpl.html",
          controller: "deleteModalController",
          controllerAs: 'dmc',
          size: "md",
          resolve: {
              map: map
          }
        });

        modalInstance.result.then(function (decision) {
            if(decision === true)
            {
                mapService.deleteMap(map._id).then(function()
                {
                    mapService.getAllMaps().then(function(data)
                    {
                        that.items = data.data;
                    })
                });
            }
        }, function () {
            console.log('no delete');
        });
    }
}]);

app.controller('editMapController', ['mapService', '$stateParams', '$state', '$websocket', '$rootScope', '$timeout', function(mapService, $stateParams, $state, $websocket, $rootScope, $timeout)
{
    var that = this;
    that.id = $stateParams.id;
    this.loading = true;

    mapService.getMap($stateParams.id).then(function successCallback(data)
    {
        that.loading = false;
        that.map = data.data;
    });

    this.go = function(form, file)
    {
        if(typeof file == 'undefined')
        {
            var websocket = false;
        }
        else
        {
            var websocket = true;
        }
        that.loading = true;
        mapService.updateMap(form, file).then(function successCallback(data)
        {
            if(websocket === true)
            {
                var socket = $websocket($rootScope.config.wsProtocol + $rootScope.config.domain + ":" +$rootScope.config.port + "/api/maps/");

                socket.send(JSON.stringify({
                    action: "add.refresh"
                }));

                socket.onMessage(function(message)
                {
                    console.log(message);
                    let msg = JSON.parse(message.data);
                    console.log(msg);
                    if(msg.action == "refresh")
                    {
                        that.loading = false;
                        socket.close();
                        $state.go('manage');
                    }
                });
            }
            else
            {
                $timeout(function()
                {
                    $state.go('manage');
                }, 750);
            }

            // Backup if websockets fail
            $timeout(function()
            {
                // backup
                if(that.loading === true)
                {
                    socket.close();
                    $state.go('manage');
                }
            }, 25000);
        });
    }
}]);

// handles file upload
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                  modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

// Modal Controllers
app.controller('hideModalController', ['$uibModalInstance', 'map',function($uibModalInstance, map)
{
    var that = this;
    this.map = map;

    this.ok = function()
    {
        $uibModalInstance.close(true);
    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss(false);
    }
}]);

app.controller('deleteModalController', ['$uibModalInstance', 'map', function($uibModalInstance, map)
{
    var that = this;

    this.map = map;

    this.ok = function()
    {
        $uibModalInstance.close(true);
    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss(false);
    }
}]);

app.controller('confirmModalController', ['$uibModalInstance', function($uibModalInstance)
{
    var that = this;

    this.ok = function()
    {
        $uibModalInstance.close(true);
    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss(false);
    }
}]);

app.controller('renameModalController', ['$uibModalInstance', 'map', function($uibModalInstance, map)
{
    var that = this;

    this.map = map;

    this.ok = function(name)
    {
        $uibModalInstance.close({name: name, status: true});
    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss({status: false});
    }
}]);

app.controller('resetModalController', ['$uibModalInstance', function($uibModalInstance)
{
    var that = this;

    this.ok = function()
    {
        $uibModalInstance.close(true);
    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss(false);
    }
}]);

app.controller('sessionModalController', ['$uibModalInstance', 'localStorageService', 'data', 'status', function($uibModalInstance, localStorageService, data, status)
{
    var that = this;

    that.status = status;
    that.data = data;

    that.token = localStorageService.get('tabletToken');

    this.ok = function()
    {
        $uibModalInstance.close();
    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss();
    }
}]);

app.controller('tokenModalController', ['$uibModalInstance', 'loginService', '$timeout', 'localStorageService', function($uibModalInstance, loginService, $timeout, localStorageService)
{
    var that = this;

    that.disabled = false;
    that.valid = true;
    that.success = false;

    this.ok = function(password)
    {
        that.disabled = true;
        loginService.removeToken({password: password}).then(function()
        {
            // valid password
            console.log('this happened 858');
            that.valid = true;
            that.success = true;
            localStorageService.remove('tabletToken');

            $timeout(function(){
                $uibModalInstance.close(true);
            }, 1000);
        },
        function()
        {
            // invalid password
            console.log('this happened 865');
            that.valid = false;
            that.disabled = false;
        })

    }

    this.cancel = function()
    {
        $uibModalInstance.dismiss(false);
    }
}]);
