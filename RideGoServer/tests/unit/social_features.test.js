
import { jest } from '@jest/globals';
import request from 'supertest';

// --- MOCKS ---
const mockDbState = new Map();
const mockSocketEmit = jest.fn();
const mockIo = {
    to: jest.fn(() => ({ emit: mockSocketEmit })),
    get: jest.fn(() => ({
        // Mock socket adapter rooms for other controllers
        adapter: { rooms: { get: () => ({ size: 0 }) } }
    })),
    sockets: {
        sockets: { get: jest.fn() }
    }
};

// Mock Firebase
jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                if (token === 'user1-token') return { uid: 'user1', email: 'user1@test.com' };
                if (token === 'user2-token') return { uid: 'user2', email: 'user2@test.com' };
                throw new Error('Invalid token');
            }),
            getUser: jest.fn(),
        }),
        messaging: () => ({ send: jest.fn() }),
        firestore: { FieldValue: { increment: jest.fn() } }
    },
    db: {
        collection: (colName) => ({
            doc: (docId) => ({
                id: docId || 'mock_doc_id',
                get: jest.fn(async () => {
                    const key = `${colName}/${docId}`;
                    return { exists: mockDbState.has(key), data: () => mockDbState.get(key), id: docId };
                }),
                set: jest.fn(async (data) => {
                    mockDbState.set(`${colName}/${docId}`, data);
                }),
                update: jest.fn(async (data) => {
                    const key = `${colName}/${docId}`;
                    if (mockDbState.has(key)) mockDbState.set(key, { ...mockDbState.get(key), ...data });
                }),
                collection: (subCol) => ({
                    doc: (subId) => ({
                        get: jest.fn(async () => {
                            const key = `${colName}/${docId}/${subCol}/${subId}`;
                            return { exists: mockDbState.has(key), data: () => mockDbState.get(key), id: subId };
                        }),
                        set: jest.fn(async (data) => {
                            mockDbState.set(`${colName}/${docId}/${subCol}/${subId}`, data);
                        }),
                        collection: (deepSub) => ({
                            add: jest.fn(async (data) => {
                                const id = 'msg_' + Date.now();
                                mockDbState.set(`${colName}/${docId}/${subCol}/${subId}/${deepSub}/${id}`, data);
                                return { id };
                            })
                        })
                    }),
                    add: jest.fn(async (data) => {
                        const id = 'msg_' + Date.now();
                        // Special handling for chat messages vs general add
                        // Pattern in service: db.collection('conversations').doc(id).collection('messages').add
                        mockDbState.set(`${colName}/${docId}/${subCol}/${id}`, data);
                        return { id };
                    }),
                    get: jest.fn(async () => ({ docs: [] })), // Simplified for validation
                    // basic order/limit mocks
                    orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) })
                })
            }),
            where: (field, op, val) => ({
                where: (f2, o2, v2) => ({
                    where: (f3, o3, v3) => ({
                        get: jest.fn(async () => {
                            // Mock Friend Request Search
                            // Very basic filter
                            const hits = [];
                            for (const [k, v] of mockDbState.entries()) {
                                if (k.startsWith('friend_requests/') && v.from === val && v.to === v2) hits.push({ id: k.split('/')[1], data: () => v });
                            }
                            return { empty: hits.length === 0, docs: hits };
                        })
                    }),
                    get: jest.fn(async () => ({ empty: true, docs: [] })) // Simplified
                }),
                limit: (n) => ({
                    get: jest.fn(async () => {
                        // Mock User Search by Email
                        if (colName === 'users' && field === 'email') {
                            if (val === 'user2@test.com') return { empty: false, docs: [{ id: 'user2', data: () => ({ email: 'user2@test.com' }) }] };
                        }
                        return { empty: true, docs: [] };
                    })
                })
            }),
            add: jest.fn(async (data) => {
                const id = 'req_' + Date.now();
                mockDbState.set(`${colName}/${id}`, data);
                return { id };
            })
        }),
        batch: () => ({
            update: (ref, data) => {
                // Manually parse ref logic or simplistic override
            },
            set: (ref, data) => {
                // We know implementing full batch mock is hard.
                // Let's rely on integration tests or simpler mock logic for Accept.
                // For Unit Test of Controller, we just need Service to return success.
            },
            commit: jest.fn()
        })
    }
}));

// Mock Services
jest.unstable_mockModule('../../src/services/presenceService.js', () => ({
    default: {
        getUserSocketIds: jest.fn(async () => ['socket_u2']),
    }
}));

// Mock Friend Service specifically to avoid complex batch DB mocking in Unit Test
// We want to test the Controller -> Service flow mostly, or Service logic with better DB Mocks.
// Let's Mock FriendService partially for complex batch ops, but test simple logic.
// Actually, let's keep FriendService real and rely on the fact that batch.commit is mocked to do nothing but succeed.

const app = (await import('../../src/app.js')).default;
app.set('socketio', mockIo);

describe('Social Features', () => {

    beforeEach(() => {
        mockDbState.clear();
        mockDbState.set('users/user1', { uid: 'user1', email: 'user1@test.com' });
        mockDbState.set('users/user2', { uid: 'user2', email: 'user2@test.com' });
    });

    it('User 1 sends friend request to User 2', async () => {
        const res = await request(app)
            .post('/api/friends/request')
            .set('Authorization', 'Bearer user1-token')
            .send({ toEmail: 'user2@test.com' });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.from).toBe('user1');
        expect(res.body.to).toBe('user2');
    });

    it('User 1 sends chat message to User 2', async () => {
        const res = await request(app)
            .post('/api/chat/send')
            .set('Authorization', 'Bearer user1-token')
            .send({ recipientId: 'user2', text: 'Hello Friend!' });

        expect(res.statusCode).toBe(201);
        expect(res.body.senderId).toBe('user1');
        expect(res.body.text).toBe('Hello Friend!');

        // Check Socket
        expect(mockIo.to).toHaveBeenCalledWith('socket_u2');
        expect(mockSocketEmit).toHaveBeenCalledWith('receive_message', expect.objectContaining({
            text: 'Hello Friend!'
        }));
    });

});
