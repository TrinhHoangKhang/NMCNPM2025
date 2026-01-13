import { jest } from '@jest/globals';

// =====================================================
// PHẦN 1: CẤU HÌNH MOCKs (Giả lập dữ liệu)
// =====================================================

// Tạo giả lập cho hàm lấy dữ liệu từ Firebase
const mockGet = jest.fn();
// Tạo giả lập cho hàm transaction (giao dịch an toàn)
const mockRunTransaction = jest.fn();

// Giả lập toàn bộ Firestore (cơ sở dữ liệu)
const mockFirestore = {
    // collection('tên'): lấy một bộ sưu tập
    collection: jest.fn(() => ({
        // doc('id'): lấy một tài liệu cụ thể
        doc: jest.fn(() => ({
            // get(): đọc dữ liệu từ tài liệu
            get: mockGet
        }))
    })),
    // runTransaction(): thực hiện giao dịch an toàn
    runTransaction: mockRunTransaction
};

// Giả lập module Firebase Config
jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {
        firestore: {
            FieldValue: {
                serverTimestamp: jest.fn(),    // Timestamp hiện tại từ server
                increment: jest.fn(v => v)     // Tăng giá trị
            }
        }
    },
    db: mockFirestore
}));

// =====================================================
// PHẦN 2: IMPORT CONTROLLER VÀ TẠO MOCK REQUEST/RESPONSE
// =====================================================

// Import controller thanh toán thực sự
const { default: paymentController } = await import('../../src/controllers/paymentController.js');

// Tạo giả lập request (yêu cầu từ client)
const mockReq = (params = {}) => ({ params, user: { uid: 'user1' } });

// Tạo giả lập response (phản hồi về client)
const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);  // res.status(200) trả về res để có thể .json()
    res.json = jest.fn(() => res);    // res.json({...}) trả về response
    return res;
};

// =====================================================
// PHẦN 3: BỘ TEST CHÍNH
// =====================================================

// describe: nhóm các test lại với nhau
describe('Payment Controller Tests', () => {
    // Chạy trước mỗi test: xóa sạch tất cả mock
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ===== TEST HÀM: Tạo mã QR thanh toán =====
    describe('generatePaymentQR', () => {
        // Test 1: Tạo QR thành công
        it('should generate QR successfully', async () => {
            const req = mockReq({ id: 'trip1' });
            const res = mockRes();

            // Giả lập: lấy dữ liệu chuyến đi từ Firestore
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({
                    status: 'COMPLETED',           // Chuyến đi đã hoàn thành
                    paymentMethod: 'WALLET',       // Thanh toán bằng ví
                    driverId: 'driver1',           // ID tài xế
                    fare: 100000                   // Giá tiền
                })
            });

            // Giả lập: lấy thông tin ngân hàng của tài xế
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({
                    bankAccount: '123456',         // Số tài khoản
                    bankName: 'MB',                // Tên ngân hàng
                    bankOwnerName: 'John Doe'      // Tên chủ tài khoản
                })
            });

            // Gọi hàm thực sự
            await paymentController.generatePaymentQR(req, res);

            // Kiểm tra: phản hồi status 200 (thành công)
            expect(res.status).toHaveBeenCalledWith(200);
            // Kiểm tra: trả về QR URL chứa 'vietqr.io' và số tiền 100000
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    qrUrl: expect.stringContaining('vietqr.io'),
                    amount: 100000
                })
            );
        });

        // Test 2: Lỗi - chuyến đi không tìm thấy
        it('should fail if trip not found', async () => {
            const req = mockReq({ id: 'notfound' });
            const res = mockRes();

            // Giả lập: chuyến đi không tồn tại
            mockGet.mockResolvedValueOnce({ exists: false });

            await paymentController.generatePaymentQR(req, res);

            // Kiểm tra: trả về status 404 (không tìm thấy)
            expect(res.status).toHaveBeenCalledWith(404);
        });

        // Test 3: Lỗi - chuyến đi chưa hoàn thành
        it('should fail if trip not completed', async () => {
            const req = mockReq({ id: 'trip1' });
            const res = mockRes();

            // Giả lập: chuyến đi chưa hoàn thành (chỉ đang trong quá trình)
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ status: 'IN_PROGRESS', paymentMethod: 'WALLET' })
            });

            await paymentController.generatePaymentQR(req, res);

            // Kiểm tra: trả về status 400 (yêu cầu không hợp lệ)
            expect(res.status).toHaveBeenCalledWith(400);
        });

        // Test 4: Lỗi - phương thức thanh toán không phải ví (là CASH)
        it('should fail if payment method not WALLET', async () => {
            const req = mockReq({ id: 'trip1' });
            const res = mockRes();

            // Giả lập: phương thức thanh toán là tiền mặt CASH
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ status: 'COMPLETED', paymentMethod: 'CASH' })
            });

            await paymentController.generatePaymentQR(req, res);

            // Kiểm tra: trả về status 400
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ===== TEST HÀM: Xác nhận thanh toán =====
    describe('confirmPayment', () => {
        // Test 5: Xác nhận thanh toán và ghi nợ thành công
        it('should confirm payment and record debt', async () => {
            const req = mockReq({ id: 'trip1' });
            const res = mockRes();

            // Giả lập transaction (giao dịch)
            const mockTransaction = {
                get: jest.fn().mockResolvedValue({
                    exists: true,
                    data: () => ({
                        fare: 100000,                    // Giá tiền
                        driverId: 'driver1',             // ID tài xế
                        payment_status: 'PENDING'        // Trạng thái chờ thanh toán
                    })
                }),
                update: jest.fn()                        // Cập nhật dữ liệu
            };

            // Giả lập: chạy transaction
            mockRunTransaction.mockImplementation(async (cb) => cb(mockTransaction));

            await paymentController.confirmPayment(req, res);

            // Kiểm tra: đã gọi update (cập nhật dữ liệu)
            expect(mockTransaction.update).toHaveBeenCalled();
            // Kiểm tra: trả về status 200 (thành công)
            expect(res.status).toHaveBeenCalledWith(200);
        });

        // Test 6: Lỗi - chuyến đi không tìm thấy
        it('should fail if trip not found', async () => {
            const req = mockReq({ id: 'notfound' });
            const res = mockRes();

            // Giả lập: chuyến đi không tồn tại
            mockRunTransaction.mockImplementation(async (cb) => {
                const mockTx = {
                    get: jest.fn().mockResolvedValue({ exists: false })
                };
                return cb(mockTx);
            });

            await paymentController.confirmPayment(req, res);

            // Kiểm tra: trả về status 400 (lỗi yêu cầu)
            expect(res.status).toHaveBeenCalledWith(400);
        });

        // Test 7: Lỗi - chuyến đi đã thanh toán rồi
        it('should fail if already paid', async () => {
            const req = mockReq({ id: 'trip1' });
            const res = mockRes();

            // Giả lập: chuyến đi đã ở trạng thái PAID (đã thanh toán)
            mockRunTransaction.mockImplementation(async (cb) => {
                const mockTx = {
                    get: jest.fn().mockResolvedValue({
                        exists: true,
                        data: () => ({ payment_status: 'PAID' })  // Đã thanh toán
                    })
                };
                return cb(mockTx);
            });

            await paymentController.confirmPayment(req, res);

            // Kiểm tra: trả về status 400 (không thể thanh toán lần nữa)
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});