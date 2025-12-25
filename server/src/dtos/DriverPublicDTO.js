// src/dtos/DriverPublicDTO.js
class DriverPublicDTO {
    constructor(driver) {
        this.id = driver.id;
        this.name = driver.name;
        this.rating = driver.rating;
        this.vehicleModel = driver.vehicle.model;
        this.vehiclePlate = driver.vehicle.plateNumber;
        // Notice we REMOVED email, phone, and walletBalance
    }
}
module.exports = DriverPublicDTO;