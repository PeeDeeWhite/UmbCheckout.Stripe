function UmbCheckout($scope, umbCheckoutResources, $routeParams, notificationsService, formHelper, $location) {
    var vm = this;
    vm.deleteButtonState = "init";
    vm.saveButtonState = "init";
    vm.properties = [];
    vm.LicenseState = {};
    vm.stripeShippingRates = [];
    vm.stripeShippingRate = {};

    vm.clickItem = clickItem;

    function clickItem(item) {

        vm.properties.forEach(function (v) {
            if (v.alias == "name") v.value = item.displayName;
            if (v.alias == "value") {
                v.value = item.id

                umbCheckoutResources.getStripeShippingRate(v.value)
                    .then(function (response) {

                        vm.stripeShippingRate = response.data
                    })
            };
        });
    }

    umbCheckoutResources.getLicenseStatus()
        .then(function (response) {
            if (response.data.status == "Invalid" || response.data.status == "Unlicensed") {
                vm.LicenseState.Valid = false;
                vm.LicenseState.Message = "UmbCheckout is running in unlicensed mode, please <a href=\"#\" target=\"_blank\"  class=\"red bold underline\">purchase a license</a> to support development"
            } else if (response.data.status == "Active") {
                vm.LicenseState.Valid = true;
            }
        }
        );

    umbCheckoutResources.getShippingRate($routeParams.id)
        .then(function (response) {

            vm.properties = response.data

            response.data.forEach(function (v) {
                if (v.alias == "value") {
                    if (v.value) {
                        umbCheckoutResources.getStripeShippingRate(v.value)
                            .then(function (response) {

                                vm.stripeShippingRate = response.data
                            })
                    }
                };
            });
        }
    );

    umbCheckoutResources.getStripeShippingRates()
        .then(function (response) {
            angular.forEach(response.data, function (value, key) {

                value.name = value.displayName
            });

            vm.stripeShippingRates = response.data
        }
        );

    vm.options = {
        includeProperties: [
            { alias: "id", header: "ID" }
        ]
    };

    function saveShippingRate() {
        vm.saveButtonState = "busy";

        if (formHelper.submitForm({ scope: $scope })) {
            var configurationValues = {};
            angular.forEach(vm.properties, function (value, key) {

                var newKey = value.alias;

                configurationValues[newKey] = value.value
            });

            umbCheckoutResources.updateShippingRate(configurationValues, $routeParams.id)
                .then(function (response) {
                    vm.properties = response.data
                    notificationsService.success("Shipping Rate saved", "The Shipping Rate has been saved successfully");
                    vm.saveButtonState = "success";
                    $scope.shippingRateForm.$dirty = false;
                })
                .catch(
                    function (response) {
                        notificationsService.error("Shipping Rate failed to save", "There was an issue trying to save the Shipping Rate");
                        vm.saveButtonState = "error";
                    }
                );
        }
        else {
            vm.saveButtonState = "error";
        }
    }

    vm.saveShippingRate = saveShippingRate;

    function deleteShippingRate() {
        vm.deleteButtonState = "busy";

        umbCheckoutResources.deleteShippingRate($routeParams.id)
            .then(function (response) {
                vm.properties = response.data
                notificationsService.success("Shipping Rate deleted", "The Shipping Rate has been deleted successfully");
                vm.saveButtonState = "success";
                $location.path("/settings/umbCheckout/shippingrates");
            })
            .catch(
                function (response) {
                    notificationsService.error("Shipping Rate failed to delete", "There was an issue trying to delete the Shipping Rate");
                    vm.saveButtonState = "error";
                }
            );
    }

    vm.deleteShippingRate = deleteShippingRate;
}
angular.module("umbraco").controller("UmbCheckout.ShippingRate.Controller", UmbCheckout);