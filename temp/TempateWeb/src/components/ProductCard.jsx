import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export function ProductCard(props) {
  const { category_id, description, id, image, price, rating_count, rating_rate, title } = props;
  // console.log(props)

  const categoryName = title;
  

  return (
    <Card className="w-70 aspect-4/5 m-5 p-1 flex flex-col">
      <CardHeader className="mt-10 flex flex-row align-middle justify-center items-center">
        <CardTitle className="w-64 truncate text-2xl">{title}</CardTitle>
        
        {(rating_count >= 500) ? (
          <span className="rounded-md bg-red-600 px-2 py-1 
            font-medium text-red-50 10 text-sm">
            Hot
          </span> 
          ) : (
          <span className="rounded-md bg-white px-2 py-1 
            font-medium text-white 10 text-sm">
            Hot
          </span> 
        )}

      </CardHeader>
      <CardContent>
        <div className='justify-center items-center flex mb-7'>
          {image ? (
            <img src={image} alt={title} className="w-4/5 h-48 object-cover rounded-md mb-4" />
          ) : (
            <div className="w-4/5 aspect-2/1 bg-gray-200 flex items-center 
              justify-center rounded-md mb-4 text-gray-500">300 x 150</div>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
        <p className="text-2xl font-bold mt-2">{price} đ</p>
        <p className="text-sm text-gray-700">
          <span className="text-yellow-500">&#9733;</span> 
          {rating_rate} &#183; 
          {rating_count} đánh giá</p>
      </CardContent>
      <CardFooter className="flex justify-between mt-auto mb-6">
        <p className="text-sm text-gray-700">
          Rating count: {rating_count}</p>
        <Button className="bg-blue-400 text-white text-xl">Xem chi tiết</Button>
      </CardFooter>
    </Card>
  )
}
