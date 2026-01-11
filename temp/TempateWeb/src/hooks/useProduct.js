import { productService } from "@/services/productService";

const useProduct = () => {
    return productService.getall();
};

export default useProduct;