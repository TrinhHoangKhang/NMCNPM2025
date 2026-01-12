
import fetch from 'node-fetch'; // Fallback if global fetch isn't available, but usually it is in Node 18+
// However, if node-fetch isn't installed, this import will fail. 
// my-server is type: module, and engine likely Node >= 18.
// I'll assume global fetch exists. If not, I'll use axios from node_modules since it is in dependencies.
import axios from 'axios';

const BASE_URL = 'http://localhost:3002/api/auth';

const generateUser = (role) => {
    const timestamp = Date.now();
    return {
        email: `test_${role}_${timestamp}@example.com`,
        password: 'password123',
        name: `Test ${role} ${timestamp}`,
        phone: `09${timestamp.toString().slice(-8)}`, // fast random phone
        role: role
    };
};

async function testAuth(role) {
    console.log(`\n--- Testing ${role.toUpperCase()} Auth Flow ---`);
    const user = generateUser(role);

    // 1. Register
    try {
        console.log(`Registering ${user.email}...`);
        const regRes = await axios.post(`${BASE_URL}/register`, user);
        console.log('Registration Status:', regRes.status);
        console.log('Registration Data:', regRes.data);

        if (regRes.status !== 200 && regRes.status !== 201) {
            throw new Error(`Registration failed with status ${regRes.status}`);
        }
    } catch (error) {
        console.error('Registration Error:', error.response?.data || error.message);
        return false;
    }

    // 2. Login
    try {
        console.log(`Logging in ${user.email}...`);
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: user.email,
            password: user.password
        });
        console.log('Login Status:', loginRes.status);
        console.log('Login Data:', JSON.stringify(loginRes.data, null, 2));

        if (loginRes.data && (loginRes.data.token || loginRes.data.user)) {
            console.log('Login Successful: Token received.');
            return true;
        } else {
            console.log('Login Failed: No token/user in response.');
            return false;
        }
    } catch (error) {
        console.error('Login Error:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    const riderSuccess = await testAuth('rider');
    const driverSuccess = await testAuth('driver');

    if (riderSuccess && driverSuccess) {
        console.log('\nAll Auth Tests PASSED');
        process.exit(0);
    } else {
        console.log('\nSome Auth Tests FAILED');
        process.exit(1);
    }
}

runTests();
