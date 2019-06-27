// Services
app.service('mapService', ['$http', '$rootScope', 'localStorageService', function($http, $rootScope, localStorageService)
{
    this.getAllMaps = function()
    {
        return $http.get($rootScope.config.apiUrl + "api/maps/all");
    }

    this.getVisibleMaps = function()
    {
        return $http.get($rootScope.config.apiUrl + "api/maps/visible");
    }

    this.getMap = function(mapId)
    {
        return $http.get($rootScope.config.apiUrl + "api/maps/"+ mapId);
    }

    this.updateMap = function(formData, file)
    {
        var fd = new FormData();
        fd.append('uploadedFile', file);
        fd.append('mapId', formData._id);
        fd.append('mapName', formData.mapName);
        fd.append('description', formData.description);
        fd.append('hidden', formData.hidden);
        fd.append('update', true);
        return $http.post($rootScope.config.apiUrl + "api/maps/", fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        })
    }

    this.status = function()
    {
        let configured = localStorageService.get("recentConfigured");
        if(configured === true)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    this.favouriteStatus = function()
    {
        let configured = localStorageService.get("favouritesConfigured");
        if(configured !== true)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    this.getRecents = function()
    {
        return JSON.parse(localStorageService.get("recents"));
    }

    this.clearRecents = function()
    {
        return new Promise(function(resolve, reject) {
            $rootScope.recentList = [];
            localStorageService.set("recents", JSON.stringify($rootScope.recentList));
            resolve();
        });

    }

    this.addToRecents = function(map)
    {
        // array of obj
        var addBoolean = true;

        localStorageService.set("recentConfigured", true);
        for(let i = 0; i< $rootScope.recentList.length; i++)
        {
            if(map._id === $rootScope.recentList[i]._id)
            {
                // conflict
                addBoolean = false;
            }
        }

        // doesn't exist
        if(addBoolean === true)
        {
            if($rootScope.recentList.length == 10)
            {
                $rootScope.recentList.pop();
            }

            $rootScope.recentList.unshift(map);
            localStorageService.set("recents", JSON.stringify($rootScope.recentList));
        }
    }

    this.getFavourites = function()
    {
        return JSON.parse(localStorageService.get("favourites"));
    }

    this.addFavourite = function(map)
    {
        var addBoolean = true;
        // check if map is already in favourites
        localStorageService.set("favouritesConfigured", true);
        console.log($rootScope.favourites);
        for(let i = 0; i < $rootScope.favourites.length; i++)
        {
            if(map._id === $rootScope.favourites[i]._id)
            {
                // conflicted do not add
                addBoolean = false;
            }
        }

        if(addBoolean === true)
        {
            $rootScope.favourites.push(map);
        }

        localStorageService.set("favourites", JSON.stringify($rootScope.favourites));
    }

    this.removeFavourite = function(map)
    {
        for(let i = 0; i < $rootScope.favourites.length; i++)
        {
            if(map._id === $rootScope.favourites[i]._id)
            {
                // splice this one
                $rootScope.favourites.splice(i, 1);
            }
        }

        //update the localstorage
        localStorageService.set("favourites", JSON.stringify($rootScope.favourites));
    }

    this.checkFavourite = function(map)
    {
        return new Promise(function(resolve, reject) {
            for(let i = 0; i < $rootScope.favourites.length; i++)
            {
                if(map._id === $rootScope.favourites[i]._id)
                {
                    resolve(map); // map in favourites
                }
            }

            reject(map); // no map in favourites
        });
    };

    this.syncFavourites = function()
    {
        localStorageService.set("favourites", JSON.stringify($rootScope.favourites));
    }

    this.deleteMap = function(map)
    {
        return $http.delete($rootScope.config.apiUrl + "api/maps/" + map);
    }
}]);

// setup requires this service
app.service('configService', ['localStorageService', '$http', '$rootScope', function(localStorageService, $http, $rootScope)
{
    var that = this;
    // this creates the local storage config and sets the configured flag
    this.setup = function(data)
    {
        return new Promise(function(resolve, reject) {
            let config = data;

            // websocket secure / unsecure
            if(config.protocol == "https://")
            {
                config.wsProtocol = "wss://";
            }
            else
            {
                config.wsProtocol = "ws://";
            }


            let confirm = that.init();
            confirm.then(function()
            {
                // set config obj
                localStorageService.set("config", JSON.stringify(config));

                // set configured flag
                localStorageService.set('configured', true);
                console.log('Setup complete');
                resolve();
            }, function() {
                reject();
            });
        });
    };

    that.init = function()
    {
        return new Promise(function(resolve, reject) {
            $http.get($rootScope.config.apiUrl + "api/").then(function successCallback(data)
            {
                if(data.status == 200)
                {
                    resolve(true);
                }
            }, function errorCallback()
            {
                console.log('Unable to connect to server');
                reject();
            });
        });
    }

    this.status = function()
    {
        let configured = localStorageService.get("configured");
        if(configured === true)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    this.getConfig = function()
    {
        return JSON.parse(localStorageService.get("config"));
    };
}]);

app.service('anchorSmoothScroll', function(){

    this.scrollTo = function(eID) {

        // This scrolling function
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }

        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };

});

app.service('boilerService', ['$http', '$rootScope', function($http, $rootScope)
{
    this.createTest = function(boilerTest)
    {
        return $http.post($rootScope.config.apiUrl + "api/boilers/", boilerTest);
    }
}]);
