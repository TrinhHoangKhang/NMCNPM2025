import discountService from '../services/discountService.js';

class DiscountController {

    // GET /api/discounts
    async getDiscounts(req, res) {
        try {
            await discountService.seedDefaults();

            const userId = req.user.uid;
            const role = req.user.role;

            if (role === 'ADMIN') {
                const discounts = await discountService.getAllDiscounts();
                res.status(200).json(discounts);
            } else {
                // For riders, show only their CLAIMED discounts
                const discounts = await discountService.getUserDiscounts(userId);
                res.status(200).json(discounts);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/discounts/:id
    async getDiscountInfo(req, res) {
        try {
            const { id } = req.params;
            const discount = await discountService.getDiscountById(id);
            if (!discount) return res.status(404).json({ error: "Mã giảm giá không tồn tại" });
            res.status(200).json(discount);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // POST /api/discounts/claim
    async claimDiscount(req, res) {
        try {
            const userId = req.user.uid;
            const { code } = req.body;
            const result = await discountService.claimDiscount(userId, code);
            const discountJson = result.toJSON ? result.toJSON() : result;
            res.status(200).json({ message: "Nhận mã thành công", discount: discountJson });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PATCH /api/discounts/:id
    async updateDiscount(req, res) {
        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: "Phải là Admin mới có quyền thực hiện" });
            }

            const { id } = req.params;
            const updates = req.body;

            if (!updates || Object.keys(updates).length === 0) {
                return res.status(400).json({ error: "Không có dữ liệu cập nhật" });
            }

            const result = await discountService.updateDiscount(id, updates);
            const discountJson = result.toJSON ? result.toJSON() : result;
            res.status(200).json({ message: "Cập nhật thành công", discount: discountJson });
        } catch (error) {
            console.error("Update Discount Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
    // POST /api/discounts
    async createDiscount(req, res) {
        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: "Phải là Admin mới có quyền thực hiện" });
            }

            const discountData = req.body;
            if (!discountData.code || !discountData.type || !discountData.value) {
                return res.status(400).json({ error: "Thiếu thông tin bắt buộc (code, type, value)" });
            }

            const result = await discountService.createDiscount(discountData);
            const discountJson = result.toJSON ? result.toJSON() : result;
            res.status(201).json({ message: "Tạo mã thành công", discount: discountJson });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new DiscountController();
