// src/models/User.js
class User {
    constructor(id, data) {
        this.id = id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.createdAt = data.createdAt || new Date();
    }

    // Common method for all users
    getPublicProfile() {
        return {
            id: this.id,
            name: this.name
        };
    }
}
module.exports = User;