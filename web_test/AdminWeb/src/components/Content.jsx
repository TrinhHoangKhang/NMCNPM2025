import React, { useState, useMemo, useEffect } from 'react';
import Paging from './Paging.jsx';
import { ProductCard } from './ProductCard.jsx';
import { useLocalStorage } from '@/hooks/useLocalStorage.js';
import { useLoaderData } from 'react-router-dom';

const MAX_PRODUCTS_PER_PAGE = 2;

export const Content = () => {    
    const [page, setPage] = useState(1);
    const initialProducts = useLoaderData();

    const [products, setProducts] = useLocalStorage("products", []);

    useEffect(() => {
        if (initialProducts && initialProducts.length > 0 && products.length === 0) {
            setProducts(initialProducts);
        }
    }, [initialProducts, products, setProducts]);
    
    function GetDataPage(){
        const startIndex = (page - 1) * MAX_PRODUCTS_PER_PAGE;
        const endIndex = startIndex + MAX_PRODUCTS_PER_PAGE;
        return products.slice(startIndex, endIndex);
    }

    const totalPages = useMemo(() => {
        return Math.ceil(products.length / MAX_PRODUCTS_PER_PAGE);
    }, [products]);

    const productsToDisplay = useMemo(() => {
        const startIndex = (page - 1) * MAX_PRODUCTS_PER_PAGE;
        const endIndex = startIndex + MAX_PRODUCTS_PER_PAGE;
        return products.slice(startIndex, endIndex);
    }, [page, products]);

    return (
        <div className='m-6'>
            <div className='text-3xl font-bold'>Sản phẩm nổi bật</div>
            <div>Đang hiển thị trang {page}/{totalPages} - mỗi trang {MAX_PRODUCTS_PER_PAGE} sản phẩm, dữ liệu từ data.js</div>
            <div className="grid grid-cols-1 md:grid-cols-2 pt-10 
                gap-5 md:gap-10 justify-items-center">
                {productsToDisplay.map(product => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
            <Paging page={page} setPage={setPage} totalPages={totalPages} />
        </div>
    );
}