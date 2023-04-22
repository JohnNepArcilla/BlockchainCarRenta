const SimpleStorage = artifacts.require("SimpleStorage");
const CarRentalService = artifacts.require("CarRentalService");
module.exports = function (deployer) {
    const availableCars = 10;
    deployer.deploy(SimpleStorage);
    deployer.deploy(CarRentalService, availableCars);
};