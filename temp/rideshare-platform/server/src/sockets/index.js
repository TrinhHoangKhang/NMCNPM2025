module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        socket.on('join_trip', (tripId) => {
            socket.join(`trip_${tripId}`);
            console.log(`Socket ${socket.id} joined trip_${tripId}`);
        });

        socket.on('join_drivers_room', () => {
            socket.join('drivers');
            console.log(`Socket ${socket.id} joined drivers room`);
        });

        socket.on('join_specific_driver_room', (driverId) => {
            const roomName = `driver_${driverId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave_drivers_room', () => {
            socket.leave('drivers');
            console.log(`Socket ${socket.id} left drivers room`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
};
