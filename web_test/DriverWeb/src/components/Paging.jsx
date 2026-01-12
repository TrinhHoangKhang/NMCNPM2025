import React, { useState } from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./ui/pagination"

const Paging = (prop) => {
    
  const { page, setPage, totalPages } = prop;

  const handlePrevious = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };

  return (
      <Pagination className={'pt-30'}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={page === 1 ? "pointer-events-none opacity-50 font-bold" : ""}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => handlePageClick(index + 1)}
                isActive={page === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
             onClick={handleNext} 
             className={page === totalPages ? "pointer-events-none opacity-50 font-bold" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
  );
};

export default Paging;
