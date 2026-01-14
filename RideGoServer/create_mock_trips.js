import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();

const userId = "JwKaagHFAofTrdaPeugvX5lai592";

// Mock trips with realistic Ho Chi Minh City locations
const mockTrips = [
    {
        riderId: userId,
        driverId: "mock_driver_1",
        pickup: {
            lat: 10.762622,
            lng: 106.660172,
            address: "Nhà Thờ Đức Bà, Quận 1, TP.HCM"
        },
        destination: {
            lat: 10.823099,
            lng: 106.629662,
            address: "Sân bay Tân Sơn Nhất, Tân Bình, TP.HCM"
        },
        vehicleType: "4_SEATS",
        fare: 180000,
        distance: 8500,
        duration: 1200,
        status: "COMPLETED",
        paymentMethod: "WALLET",
        paymentStatus: "COMPLETED",
        createdAt: new Date("2026-01-10T08:30:00").toISOString(),
        completedAt: new Date("2026-01-10T08:50:00").toISOString(),
        ratingDriver: 5,
        ratingTrip: 5
    },
    {
        riderId: userId,
        driverId: "mock_driver_2",
        pickup: {
            lat: 10.772461,
            lng: 106.698055,
            address: "Chợ Bến Thành, Quận 1, TP.HCM"
        },
        destination: {
            lat: 10.854886,
            lng: 106.631554,
            address: "Đại học Bách Khoa, Quận 10, TP.HCM"
        },
        vehicleType: "MOTORBIKE",
        fare: 35000,
        distance: 5200,
        duration: 900,
        status: "COMPLETED",
        paymentMethod: "CASH",
        paymentStatus: "COMPLETED",
        createdAt: new Date("2026-01-11T14:15:00").toISOString(),
        completedAt: new Date("2026-01-11T14:30:00").toISOString(),
        ratingDriver: 4,
        ratingTrip: 4
    },
    {
        riderId: userId,
        driverId: "mock_driver_3",
        pickup: {
            lat: 10.776889,
            lng: 106.700806,
            address: "Bitexco Financial Tower, Quận 1, TP.HCM"
        },
        destination: {
            lat: 10.729194,
            lng: 106.721169,
            address: "Vincom Mega Mall, Quận 2, TP.HCM"
        },
        vehicleType: "4_SEATS",
        fare: 95000,
        distance: 6800,
        duration: 1080,
        status: "COMPLETED",
        paymentMethod: "WALLET",
        paymentStatus: "COMPLETED",
        createdAt: new Date("2026-01-12T18:45:00").toISOString(),
        completedAt: new Date("2026-01-12T19:03:00").toISOString(),
        ratingDriver: 5,
        ratingTrip: 5
    },
    {
        riderId: userId,
        driverId: "mock_driver_4",
        pickup: {
            lat: 10.762622,
            lng: 106.660172,
            address: "Bưu điện Trung tâm, Quận 1, TP.HCM"
        },
        destination: {
            lat: 10.784848,
            lng: 106.695896,
            address: "Công viên Tao Đàn, Quận 1, TP.HCM"
        },
        vehicleType: "MOTORBIKE",
        fare: 28000,
        distance: 3200,
        duration: 600,
        status: "COMPLETED",
        paymentMethod: "CASH",
        paymentStatus: "COMPLETED",
        createdAt: new Date("2026-01-13T10:20:00").toISOString(),
        completedAt: new Date("2026-01-13T10:30:00").toISOString(),
        ratingDriver: 4,
        ratingTrip: 4
    },
    {
        riderId: userId,
        driverId: "mock_driver_5",
        pickup: {
            lat: 10.771969,
            lng: 106.697739,
            address: "Nhà hát Thành phố, Quận 1, TP.HCM"
        },
        destination: {
            lat: 10.806412,
            lng: 106.717873,
            address: "Thảo Cầm Viên, Quận 1, TP.HCM"
        },
        vehicleType: "7_SEATS",
        fare: 120000,
        distance: 4500,
        duration: 840,
        status: "COMPLETED",
        paymentMethod: "WALLET",
        paymentStatus: "COMPLETED",
        createdAt: new Date("2026-01-14T07:00:00").toISOString(),
        completedAt: new Date("2026-01-14T07:14:00").toISOString(),
        ratingDriver: 5,
        ratingTrip: 5
    }
];

async function createMockTrips() {
    try {
        console.log('🚀 Starting to create mock trips...');
        console.log(`User ID: ${userId}`);
        
        for (let i = 0; i < mockTrips.length; i++) {
            const trip = mockTrips[i];
            
            // Also add pickupLocation and dropoffLocation for compatibility
            trip.pickupLocation = trip.pickup;
            trip.dropoffLocation = trip.destination;
            
            const docRef = await db.collection('trips').add(trip);
            
            console.log(`✅ Trip ${i + 1}/5 created with ID: ${docRef.id}`);
            console.log(`   ${trip.pickup.address} → ${trip.destination.address}`);
            console.log(`   ${trip.vehicleType} | ${trip.fare.toLocaleString('vi-VN')} ₫ | ${trip.paymentMethod}`);
        }
        
        console.log('\n✨ All 5 mock trips created successfully!');
        console.log('📊 Total fare: ' + mockTrips.reduce((sum, t) => sum + t.fare, 0).toLocaleString('vi-VN') + ' ₫');
        console.log('\nYou can now test the chatbot with queries like:');
        console.log('- "Tôi đã đi bao nhiêu chuyến?"');
        console.log('- "Tổng chi phí của tôi là bao nhiêu?"');
        console.log('- "Hôm nay tôi đi chuyến nào?"');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating mock trips:', error);
        process.exit(1);
    }
}

createMockTrips();
