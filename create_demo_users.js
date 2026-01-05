

const API_URL = 'http://localhost:3001/api';

async function registerUser(name, email, phone, role) {
    console.log(`Registering ${role}: ${email}...`);
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                phone,
                password: 'password123',
                role,
                ...(role === 'driver' ? { vehicleType: 'Bike', licensePlate: '59-A1 12345' } : {})
            })
        });

        const data = await response.json();
        if (response.status === 201) {
            console.log(`SUCCESS: Created ${role} - ${email}`);
        } else if (response.status === 400 && data.error === 'User already exists') {
            console.log(`INFO: ${role} ${email} already exists.`);
        } else {
            console.error(`FAILED: ${data.message || data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function main() {
    await registerUser('Demo Driver', 'driver@test.com', '0909000001', 'driver');
    await registerUser('Demo Rider', 'rider@test.com', '0909000002', 'rider');
    await registerUser('Demo Admin', 'admin@test.com', '0909000003', 'admin');
}

main();
