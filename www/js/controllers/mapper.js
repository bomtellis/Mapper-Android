app.controller('MapperController', ['$rootScope', function($rootScope) {
    var that = this;
    that.error = $rootScope.errorLoading;
    that.loading = $rootScope.checkedServer;
}]);

app.controller('mapFinderController', ['mapService', '$state', function(mapService, $state)
{
    var that = this;
    mapService.getVisibleMaps().then(function successCallback(data)
    {
        that.mapData = data.data;
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
app.controller('setupController', ['configService', '$rootScope', '$state', '$timeout', function(configService, $rootScope, $state, $timeout)
{
    var that = this;
    that.loading = false;

    if($rootScope.checkedServer == false)
    {
        that.error = true;
    }

    // get existing config if possible
    var status = configService.status();
    if(status === true)
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
            apiUrl: apiUrl
        };

        configService.setup($rootScope.config).then(function()
        {
            // resolve
            that.loading = false;
            $rootScope.checkedServer = true;
            $state.go('mapFinder');
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
