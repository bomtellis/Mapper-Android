app.controller('admin.home', ['adminService', function(adminService) {
	var that = this;

	adminService.stats().then(function(data) {
			that.stats = data.data;
		},
		function() {
			// unable to get stats
		})
}]);

app.controller('admin.users', ['adminService', '$uibModal', 'ngToast', function(adminService, $uibModal, ngToast) {
	var that = this;

	adminService.users().then(function(data) {
			that.users = data.data;
		},
		function() {
			// unable to get stats
		});

	this.toggleActive = function(user) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./views/modals/admin/toggleActive.tpl.html",
			controller: "admin.modal",
			controllerAs: 'modal',
			size: "md",
			resolve: {
				userData: user
			}
		});

        modalInstance.result.then(function() {
            adminService.toggleActive(user._id, !user.active).then(function(data)
            {
                ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.success.name + ": " + data.data.success.message,
					dismissButton: true
				});

                adminService.users().then(function(data) {
            			that.users = data.data;
            		},
            		function() {
            			// unable to get stats
            		});
            },
            function(data)
            {
                ngToast.create({
                    className: "warning",
                    timeout: 5000,
                    content: data.data.error.name + ": " + data.data.error.message,
                    dismissButton: true
                });
            });
        },
        function() {
            // exit case
        });
	};

	this.deleteUser = function(user) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./views/modals/admin/deleteUser.tpl.html",
			controller: "admin.modal",
			controllerAs: 'modal',
			size: "md",
			backdrop: 'static',
			resolve: {
				userData: user
			}
		});

        modalInstance.result.then(function() {
            console.log('76');
            adminService.deleteUser(user._id).then(function(data)
            {
                ngToast.create({
					className: "danger",
					timeout: 5000,
					content: data.data.success.name + ": " + data.data.success.message,
					dismissButton: true
				});

                adminService.users().then(function(data) {
            			that.users = data.data;
            		},
            		function() {
            			// unable to get stats
            		});
            },
            function(data)
            {
                ngToast.create({
                    className: "warning",
                    timeout: 5000,
                    content: data.data.error.name + ": " + data.data.error.message,
                    dismissButton: true
                });
            });
        },
        function() {
            //exit case
        });
	}
}]);

app.controller('admin.maps', ['mapService', function(mapService) {
	var that = this;

	mapService.getAllMaps().then(function(data) {
			that.maps = data.data;
		},
		function() {
			// unable to get stats
		})
}]);

app.controller('admin.create', ['adminService', 'ngToast', '$timeout', '$state', function(adminService, ngToast, $timeout, $state) {
	var that = this;

	this.go = function(formModel) {
		adminService.createUser(formModel).then(function() {
				ngToast.create({
					className: "success",
					timeout: 5000,
					content: "Successfully created user",
					dismissButton: true
				});

				$timeout(function() {
					$state.go('admin.users');
				}, 200);
			},
			function(data) {
				ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.error.name + ": " + data.data.error.message,
					dismissButton: true
				});
			});
	};
}]);

app.controller('admin.changeRole', ['adminService', '$stateParams', '$state', 'ngToast', '$timeout', function(adminService, $stateParams, $state, ngToast, $timeout) {
	var that = this;

	if (!$stateParams.id) {
		$state.go('admin.users');
	}

	console.log($stateParams.userData);

	if ($stateParams.userData.object == true) {
		// fetch data
		adminService.fetchUser($stateParams.id).then(function(data) {
				that.user = data.data;
			},
			function(data) {
				console.log('Unable to get user data, please retry');
				ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.error.name + ": " + data.data.error.message,
					dismissButton: true
				});
			});
	} else {
		that.user = $stateParams.userData;
	}

	this.go = function(newRole) {
		var obj = {
			id: that.user._id,
			role: newRole
		}
		adminService.changeRole(obj).then(function(data) {
				ngToast.create({
					className: "success",
					timeout: 5000,
					content: data.data.success.name + ": " + data.data.success.message,
					dismissButton: true
				});

				$timeout(function() {
					$state.go('admin.users');
				}, 200);
			},
			function(data) {
				ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.error.name + ": " + data.data.error.message,
					dismissButton: true
				});
			});
	}
}]);

app.controller('admin.changePassword', ['adminService', '$stateParams', '$state', 'ngToast', '$timeout', function(adminService, $stateParams, $state, ngToast, $timeout) {
	var that = this;

	if (!$stateParams.id) {
		$state.go('admin.users');
	}

	console.log($stateParams.userData);

	if ($stateParams.userData.object == true) {
		// fetch data
		adminService.fetchUser($stateParams.id).then(function(data) {
				that.user = data.data;
			},
			function(data) {
				console.log('Unable to get user data, please retry');
				ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.error.name + ": " + data.data.error.message,
					dismissButton: true
				});
			});
	} else {
		that.user = $stateParams.userData;
	}

	this.go = function(password) {
		var obj = {
			id: that.user._id,
			password: password
		}
		adminService.changePassword(obj).then(function(data) {
				ngToast.create({
					className: "success",
					timeout: 5000,
					content: data.data.success.name + ": " + data.data.success.message,
					dismissButton: true
				});

				$timeout(function() {
					$state.go('admin.users');
				}, 200);
			},
			function(data) {
				ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.error.name + ": " + data.data.error.message,
					dismissButton: true
				});
			});
	}
}]);

app.controller('admin.keys', ['adminService', '$uibModal', 'ngToast', function(adminService, $uibModal, ngToast) {
	var that = this;

	adminService.keys().then(function(data) {
			that.keys = data.data;
		},
		function() {
			// unable to get stats
		})

	this.revoke = function(apiKey)
	{
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./views/modals/admin/revokeToken.tpl.html",
			controller: "admin.modal",
			controllerAs: 'modal',
			size: "md",
			resolve: {
				userData: apiKey
			}
		});

		modalInstance.result.then(function()
		{
			adminService.revokeToken(apiKey.tokenId._id).then(function(data)
			{
				ngToast.create({
					className: "success",
					timeout: 5000,
					content: data.data.success.name + ": " + data.data.success.message,
					dismissButton: true
				});

				adminService.keys().then(function(data) {
						that.keys = data.data;
					},
					function() {
						// unable to get stats
					})
			},
			function(data)
			{
				ngToast.create({
					className: "warning",
					timeout: 5000,
					content: data.data.error.name + ": " + data.data.error.message,
					dismissButton: true
				});
			});
		},
		function()
		{
			// exit case
		});
	}
}]);

app.controller('admin.modal', ['adminService', '$uibModalInstance', 'userData', function(adminService, $uibModalInstance, userData) {
	var that = this;

	this.user = userData;

	this.ok = function() {
		$uibModalInstance.close(true);
	}

	this.cancel = function() {
		$uibModalInstance.dismiss(false);
	}
}]);
