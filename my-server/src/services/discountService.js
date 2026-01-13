import { db } from '../config/firebaseConfig.js';
import Discount from '../models/Discount.js';

class DiscountService {
    // List all active discounts (Admin might see all, Rider sees what they can claim)
    async getAllDiscounts() {
        const snapshot = await db.collection('discounts').get();
        const now = new Date();
        const discounts = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            let isActive = data.isActive;

            // Auto-lock if reach expire date
            if (isActive && data.expiryDate && new Date(data.expiryDate) < now) {
                isActive = false;
                await db.collection('discounts').doc(doc.id).update({ isActive: false });
            }

            discounts.push(new Discount(doc.id, { ...data, isActive }));
        }
        return discounts.map(d => d.toJSON());
    }

    // List discounts a user ALREADY HAS (only active ones)
    async getUserDiscounts(userId) {
        const snapshot = await db.collection('users').doc(userId).collection('claimedDiscounts').get();
        const userDiscounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch all global discounts to check status
        const globalDiscounts = await this.getAllDiscounts();
        const activeGlobalIds = new Set(globalDiscounts.filter(d => d.isActive).map(d => d.id));

        // Only return if still active globally
        return userDiscounts
            .filter(ud => activeGlobalIds.has(ud.id))
            .map(ud => {
                const discount = new Discount(ud.id, ud);
                return discount.toJSON();
            });
    }

    async getDiscountByCode(code) {
        const snapshot = await db.collection('discounts').where('code', '==', code).limit(1).get();
        if (snapshot.empty) return null;
        return new Discount(snapshot.docs[0].id, snapshot.docs[0].data());
    }

    // Rider claims a discount by code or ID
    async claimDiscount(userId, identifier) {
        let discount = await this.getDiscountById(identifier);

        if (!discount) {
            discount = await this.getDiscountByCode(identifier);
        }

        if (!discount) throw new Error("Mã hoặc ID giảm giá không tồn tại");
        if (!discount.isActive) throw new Error("Mã giảm giá hiện đang bị tạm khóa");
        if (discount.count <= 0) throw new Error("Mã giảm giá đã hết lượt sử dụng");

        // Check if user already has it
        const userClaimed = await db.collection('users').doc(userId).collection('claimedDiscounts').doc(discount.id).get();
        if (userClaimed.exists) throw new Error("Bạn đã nhận mã giảm giá này rồi");

        // Transaction to decrement count and add to user
        await db.runTransaction(async (t) => {
            const dRef = db.collection('discounts').doc(discount.id);
            const dDoc = await t.get(dRef);
            const dData = dDoc.data();

            if (dData.count <= 0) throw new Error("Mã giảm giá đã hết lượt sử dụng");

            t.update(dRef, { count: dData.count - 1 });

            const userClaimedRef = db.collection('users').doc(userId).collection('claimedDiscounts').doc(discount.id);
            t.set(userClaimedRef, {
                ...dData,
                count: 1, // User has 1 instance
                claimedAt: new Date().toISOString()
            });
        });

        return discount;
    }

    // Admin updates discount count or other fields
    async updateDiscount(id, updates) {
        const dRef = db.collection('discounts').doc(id);

        // Logic: When unlock (set isActive: true), the expire date becomes the next day
        if (updates.isActive === true) {
            const nextDay = new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            updates.expiryDate = nextDay.toISOString();
        }

        await dRef.update(updates);
        const updated = await dRef.get();
        return new Discount(updated.id, updated.data());
    }

    async getDiscountById(discountId) {
        if (!discountId) return null;
        const doc = await db.collection('discounts').doc(discountId).get();
        if (!doc.exists) return null;

        const data = doc.data();
        let isActive = data.isActive;
        const now = new Date();

        // Auto-lock if reach expire date
        if (isActive && data.expiryDate && new Date(data.expiryDate) < now) {
            isActive = false;
            await db.collection('discounts').doc(doc.id).update({ isActive: false });
        }

        return new Discount(doc.id, { ...data, isActive });
    }

    // Admin creates a new discount
    async createDiscount(discountData) {
        const dRef = await db.collection('discounts').add({
            ...discountData,
            createdAt: new Date().toISOString(),
            isActive: discountData.isActive !== undefined ? discountData.isActive : true
        });
        const doc = await dRef.get();
        return new Discount(doc.id, doc.data());
    }

    // New: Seed 12 default discount types
    async seedDefaults() {
        console.log("Checking and seeding default discounts...");
        const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

        const defaults = [
            { code: "WELCOME", description: "Giảm 10% cho bạn mới", type: "PERCENT", value: 10, maxDiscount: 20000, minOrderValue: 0, isActive: true, count: 100 },
            { code: "HOLIDAY101", description: "Mừng đại lễ - Giảm 10%", type: "PERCENT", value: 10, maxDiscount: 100000, minOrderValue: 0, isActive: true, count: 500 },
            { code: "WEEKEND300", description: "Cuối tuần bùng nổ -30%", type: "PERCENT", value: 30, maxDiscount: 30000, minOrderValue: 0, isActive: true, count: 500 },
            { code: "GIAM30K", description: "Giảm 30k đơn từ 100k", type: "FIXED", value: 30000, maxDiscount: 0, minOrderValue: 100000, isActive: true, count: 200 }
        ];

        for (const d of defaults) {
            const existing = await this.getDiscountByCode(d.code);
            if (!existing) {
                console.log(`Seeding missing discount: ${d.code}`);
                await db.collection('discounts').add({
                    ...d,
                    expiryDate,
                    createdAt: new Date().toISOString()
                });
            }
        }
    }
}

export default new DiscountService();
