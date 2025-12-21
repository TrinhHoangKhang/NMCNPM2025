// src/models/Vehicle.js
class Vehicle {
    constructor(data) {
        this.make = data.make;       // e.g., Toyota, Honda
        this.model = data.model;     // e.g., Vios, Winner X
        this.plateNumber = data.plateNumber;
        this.type = data.type;       // CAR or BIKE
        this.color = data.color;
    }
}
module.exports = Vehicle;