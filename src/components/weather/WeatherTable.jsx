"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "../ui/skeleton";

const WeatherTable = ({ data, loading }) => {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tableData = React.useMemo(() => {
    if (!data?.daily && !data?.hourly) return [];

    try {
      if (data.hourly?.time && data.hourly?.temperature_2m) {
        return data.hourly.time.map((time, i) => ({
          time,
          formattedTime: format(new Date(time), "HH:mm"),
          temperature: data.hourly.temperature_2m[i] ?? 0,
        }));
      }

      if (
        data.daily?.time &&
        data.daily?.temperature_2m_max &&
        data.daily?.temperature_2m_min &&
        data.daily?.temperature_2m_mean
      ) {
        return data.daily.time.map((date, i) => ({
          date,
          formattedDate: format(new Date(date), "MMM dd, yyyy"),
          max: data.daily.temperature_2m_max[i] ?? 0,
          min: data.daily.temperature_2m_min[i] ?? 0,
          mean: data.daily.temperature_2m_mean[i] ?? 0,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error processing weather data:", error);
      return [];
    }
  }, [data]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  const isHourlyData = !!data?.hourly;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatTemperature = (value) => {
    if (value === null || value === undefined) return "N/A";
    return Number(value).toFixed(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return loading ? (
      <Skeleton className="h-32 w-full" />
    ) : (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
          <div className="flex justify-between items-center p-4">
            <div className="text-sm text-muted-foreground">Rows per page:</div>
            <select
              className="border rounded px-2 py-1 text-sm gap-2 bg-gray-900 text-white"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              {[5, 10, 15, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </PaginationContent>
      </Pagination>
    );
  };

  if (!mounted) return null;

  if (!data || (!data.daily && !data.hourly)) {
    return (
      <div className="rounded-md border p-4 text-center text-muted-foreground">
        No weather data available
      </div>
    );
  }

  return loading ? (
    <Skeleton className="h-32 w-full" />
  ) : (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isHourlyData ? (
              <>
                <TableHead>Time</TableHead>
                <TableHead>Temperature (°C)</TableHead>
              </>
            ) : (
              <>
                <TableHead>Date</TableHead>
                <TableHead>Max Temperature (°C)</TableHead>
                <TableHead>Min Temperature (°C)</TableHead>
                <TableHead>Mean Temperature (°C)</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((row, index) => (
            <TableRow key={index}>
              {isHourlyData ? (
                <>
                  <TableCell>{row.formattedTime}</TableCell>
                  <TableCell>{formatTemperature(row.temperature)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{row.formattedDate}</TableCell>
                  <TableCell>{formatTemperature(row.max)}</TableCell>
                  <TableCell>{formatTemperature(row.min)}</TableCell>
                  <TableCell>{formatTemperature(row.mean)}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {tableData.length > 0 && (
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default WeatherTable;
