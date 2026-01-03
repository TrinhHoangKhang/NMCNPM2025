import admin from "firebase-admin";

const db = admin.firestore();

class PaymentController {
// === 1. SINH MÃ VIETQR CHO RIDER ===
 async generatePaymentQR(req, res) {
    try {
        const { id } = req.params; // tripId
        const tripRef = db.collection('trips').doc(id);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chuyến đi" });
        }

        const tripData = tripDoc.data();

        // Kiểm tra trạng thái chuyến đi
        if (tripData.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Chuyến đi chưa hoàn thành" });
        }

        if (tripData.paymentMethod !== 'WALLET') {
            return res.status(400).json({ success: false, message: "Phương thức thanh toán không phải Ví" });
        }

        // Lấy thông tin ngân hàng của Driver
        const driverDoc = await db.collection('users').doc(tripData.driverId).get();
        const driverData = driverDoc.data();

        if (!driverData.bankAccount || !driverData.bankName) {
            return res.status(400).json({ success: false, message: "Tài xế chưa cập nhật thông tin ngân hàng" });
        }

        // Tạo link VietQR động
        const description = encodeURIComponent(`RideGo thanh toan ${id}`);
        const qrUrl = `https://img.vietqr.io/image/${driverData.bankName}-${driverData.bankAccount}-qr_only.png?amount=${tripData.fare}&addInfo=${description}&accountName=${encodeURIComponent(driverData.bankOwnerName)}`;

        res.status(200).json({
            success: true,
            qrUrl: qrUrl,
            amount: tripData.fare,
            message: "Mã QR đã được khởi tạo thành công"
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// === 2. DRIVER XÁC NHẬN ĐÃ NHẬN TIỀN ===
async confirmPayment(req, res) {
        try {
            const { id } = req.params; // tripId
            const tripRef = db.collection('trips').doc(id);

            await db.runTransaction(async (transaction) => {
                const tripDoc = await transaction.get(tripRef);
                if (!tripDoc.exists) throw new Error("Chuyến đi không tồn tại");

                const tripData = tripDoc.data();
                if (tripData.payment_status === 'PAID') throw new Error("Chuyến đi đã được thanh toán");

                // 1. Cập nhật trạng thái thanh toán của Trip
                transaction.update(tripRef, {
                    payment_status: 'PAID',
                    paidAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 2. Tính toán nợ (Ví dụ chiết khấu 20%)
                const commission = tripData.fare * 0.2; 
                const driverRef = db.collection('users').doc(tripData.driverId);

                // 3. Cộng nợ vào data của Driver
                transaction.update(driverRef, {
                    debt: admin.firestore.FieldValue.increment(commission)
                });
            });

            res.status(200).json({ success: true, message: "Xác nhận thanh toán thành công, nợ đã được ghi nhận" });

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}

export default new PaymentController();