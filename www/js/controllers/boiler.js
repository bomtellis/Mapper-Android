// Abstract view - holds all the data
app.controller('boilerMasterController', ['$scope', '$state', function($scope, $state) {
  var that = this;
  $scope.state = $state;
  $scope.boilerTestStarted = false;
  that.loading = false;
  that.hideMenu = false;

  $scope.boilerTest = {};

  $scope.transistion = function() {
    delete $scope.boilerTest;
    $scope.boilerTest = {};
    $scope.boilerTestStarted = true;
    that.hideMenu = true;
    $state.go('boilers.1');
  }

  $scope.finish = function() {
    that.loading = true;
    that.hideMenu = false;
  }

  $scope.showMenu = function() {
    that.hideMenu = false;
  }

  $scope.hideMenu = function() {
    that.hideMenu = true;
  }

  $scope.startLoading = function() {
    that.loading = true;
  }

  $scope.finishLoading = function()
  {
      that.loading = false;
  }
}]);

// Each test data entry
app.controller('boilerCheckController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
  var that = this;
  $scope.menu = true; //hide menu
  that.stateParams = $stateParams;
  $scope.boilerNumber = $stateParams.boilerNumber;
  // count number of boilers
  var boilers = 3;
  if ($stateParams.boilerNumber == boilers) {
    that.next = "boilers.1";
  } else {
    that.next = "boilers." + ($scope.boilerNumber + 1);
    console.log(that.next);
  }

  var outcome = angular.isDefined($scope.boilerTest[$scope.boilerNumber]);
  if (outcome == false) {
    $scope.boilerTest[$scope.boilerNumber] = {
      stateName: $state.current.name,
      sightglass: {
        lhs: 0,
        rhs: 0
      }
    }
  }

  that.complete = function() {
    $scope.boilerTest[$scope.boilerNumber].complete = true;
    $scope.boilerTest[$scope.boilerNumber].failed = false;
    if ($stateParams.editing == true) {
      $state.go('boilers.finished');
    } else {
      if ($stateParams.boilerNumber == 3) {
        $scope.editingResults = true;
        $state.go('boilers.finished');
      } else {
        $state.go(that.next);
      }
    }

  }

  that.failed = function() {
    $scope.boilerTest[$scope.boilerNumber].complete = true;
    $scope.boilerTest[$scope.boilerNumber].failed = true;
    if ($stateParams.boilerNumber == 3) {
      $state.go('boilers.finished');
    } else {
      $state.go(that.next);
    }
  }
}])



app.controller('boilerHomeController', ['$scope', '$timeout', function($scope, $timeout) {
  console.log('reload');
  var that = this;
  $scope.showMenu();
}])

app.controller('boilerCheckCreateController', ['$scope', '$state', function($scope, $state) {
  var that = this;
  // get time of day
  var day = new Date();
  console.log(day);
  var time = new Date().getHours();
  // morning = true, evening = false
  // gt = 7pm or lt= 7am
  console.log(time);
  if(time >= 19 || time < 7)
  {
      that.dayToggle = true;
  }
  else {
      that.dayToggle = false;
  }
}])


app.controller('boilerFinishedController', ['$scope', '$state', 'boilerService', function($scope, $state, boilerService) {
  var that = this;
  $scope.hideMenu();

  that.edit = function(stateName) {
    $state.go(stateName, {
      editing: true
    });
  }

  // DEBUG: sample data
  $scope.boilerTest = {
    "1": {
      "stateName": "boilers.1",
      "sightglass": {
        "lhs": 71,
        "rhs": 69,
        "blowdown": true
      },
      "tds": 2100,
      "o2": 20,
      "fluetemp": 200,
      "safety": {
        "first": true,
        "second": true
      },
      "bottomBlowdown": {
        "status": true,
        "duration": 2,
        "quantity": 2
      },
      "complete": true,
      "failed": false
    },
    "2": {
      "stateName": "boilers.2",
      "sightglass": {
        "lhs": 69,
        "rhs": 67,
        "blowdown": true
      },
      "tds": 2100,
      "o2": 20,
      "fluetemp": 200,
      "safety": {
        "first": true,
        "second": true
      },
      "bottomBlowdown": {
        "status": true,
        "duration": 2,
        "quantity": 2
      },
      "complete": true,
      "failed": false
    },
    "3": {
      "stateName": "boilers.3",
      "sightglass": {
        "lhs": 63,
        "rhs": 61,
        "blowdown": true
      },
      "tds": 2100,
      "o2": 20,
      "fluetemp": 200,
      "safety": {
        "first": true,
        "second": true
      },
      "bottomBlowdown": {
        "status": true,
        "duration": 2,
        "quantity": 2
      },
      "complete": true,
      "failed": false
    }
  };

  var canvas = document.getElementById("canvas");
  var signaturePad = new SignaturePad(canvas);

  that.clear = function() {
    signaturePad.clear();
  }

  that.finish = function() {
    $scope.startLoading();
    var sig = signaturePad.toDataURL("image/png");
    $scope.boilerTest.signature = sig;

    boilerService.createTest($scope.boilerTest).then(function successCallback(data)
    {
        // go make a brew
        delete $scope.boilerTest
        $scope.boilerTest = {};
        $scope.showMenu();
        $scope.finishLoading();
        $state.go('boilers.home');
    },
    function errorCallback()
    {
        // its hit the fan
    });

  }
}])
