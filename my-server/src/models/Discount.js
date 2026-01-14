class Discount {
    constructor(id, data) {
        this.id = id;
        this.code = data.code;
        this.description = data.description;
        this.type = data.type; // 'PERCENT' or 'FIXED'
        this.value = parseFloat(data.value);
        this.maxDiscount = parseFloat(data.maxDiscount || 0);
        this.minOrderValue = parseFloat(data.minOrderValue || 0);
        this.expiryDate = data.expiryDate;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.count = data.count || 0; // NEW: Number of remaining redemptions
    }

    isValid(fare) {
        if (!this.isActive) return false;
        if (this.expiryDate && new Date(this.expiryDate) < new Date()) return false;
        if (this.minOrderValue && fare < this.minOrderValue) return false;
        return true;
    }

    calculateDiscount(fare) {
        if (!this.isValid(fare)) return 0;

        let discountAmount = 0;
        if (this.type === 'PERCENT') {
            discountAmount = fare * (this.value / 100);
            if (this.maxDiscount > 0) {
                discountAmount = Math.min(discountAmount, this.maxDiscount);
            }
        } else if (this.type === 'FIXED') {
            discountAmount = this.value;
        }

        return Math.min(discountAmount, fare); // Cannot discount more than fare
    }

    toJSON() {
        return {
            id: this.id,
            code: this.code,
            description: this.description,
            type: this.type,
            value: this.value,
            maxDiscount: this.maxDiscount,
            minOrderValue: this.minOrderValue,
            expiryDate: this.expiryDate,
            isActive: this.isActive,
            count: this.count
        };
    }
}

export default Discount;
