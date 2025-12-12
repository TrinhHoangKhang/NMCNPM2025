import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Dimensions, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';

const HomeScreen = () => {
    const { logout, userInfo, userToken, BASE_URL } = useContext(AuthContext);
    const [location, setLocation] = useState(null);
    const [socket, setSocket] = useState(null);
    const [tripStatus, setTripStatus] = useState('idle'); // idle, requesting, waiting_for_driver, accepted, in_ride
    const [driverLocation, setDriverLocation] = useState(null);
    const [destination, setDestination] = useState('');

    // San Francisco default
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        // Connect to Socket.io
        // IP must match server. 10.0.2.2 for Android Emulator.
        const newSocket = io('http://10.0.2.2:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket Connected:', newSocket.id);
        });

        newSocket.on('ride_accepted', (data) => {
            console.log('Ride Accepted:', data);
            setTripStatus('accepted');
            setDriverLocation(data.driver.location.coordinates);
            Alert.alert('Ride Accepted', `Driver ${data.driver.name} is on the way!`);
        });

        newSocket.on('driver_location_update', (data) => {
            setDriverLocation(data.coordinates);
        });

        return () => newSocket.close();
    }, []);

    const requestRide = async () => {
        if (!destination) {
            Alert.alert('Error', 'Please enter a destination');
            return;
        }

        try {
            setTripStatus('requesting');
            // Hardcoded coordinates for demo
            const pickup = {
                address: 'Current Location',
                coordinates: [region.longitude, region.latitude]
            };
            const dropoff = {
                address: destination,
                coordinates: [region.longitude + 0.01, region.latitude + 0.01]
            };

            await axios.post(`${BASE_URL}/rides/request`, {
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                vehicleType: 'standard',
                distance: 5000, // 5km hardcoded
                duration: 600 // 10 mins hardcoded
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setTripStatus('waiting_for_driver');

            // Join trip room if we had trip ID returned and socket logic required it
            // For now, server emits to 'drivers' and then 'trip_{id}'
            // We would need to listen to 'trip_{id}' which requires joining it? 
            // Usually server force joins socket to room or we emit 'join_trip' here.

        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to request ride');
            setTripStatus('idle');
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
            >
                {driverLocation && (
                    <Marker
                        coordinate={{
                            latitude: driverLocation[1],
                            longitude: driverLocation[0]
                        }}
                        title="Driver"
                        description="Your driver is here"
                        pinColor="blue"
                    />
                )}
            </MapView>

            <View style={styles.uiContainer}>
                <Text style={styles.greeting}>Hi, {userInfo?.name}</Text>

                {tripStatus === 'idle' && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Where to?"
                            value={destination}
                            onChangeText={setDestination}
                        />
                        <Button title="Request Ride" onPress={requestRide} />
                    </>
                )}

                {tripStatus === 'waiting_for_driver' && (
                    <Text style={styles.statusText}>Looking for a driver...</Text>
                )}

                {tripStatus === 'accepted' && (
                    <Text style={styles.statusText}>Driver is on the way!</Text>
                )}

                <View style={{ marginTop: 20 }}>
                    <Button title="Logout" onPress={logout} color="red" />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    uiContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5
    },
    greeting: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
    statusText: { fontSize: 16, color: 'green', fontWeight: 'bold', textAlign: 'center', marginVertical: 10 }
});

export default HomeScreen;
