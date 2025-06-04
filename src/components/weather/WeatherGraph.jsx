"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "../ui/skeleton";

const WeatherGraph = ({ data, loading }) => {
  const [activeChart, setActiveChart] = useState("mean");

  const chartData = React.useMemo(() => {
    if (!data?.daily && !data?.hourly) return [];

    if (data.hourly) {
      return data.hourly.time.map((time, i) => ({
        time,
        formattedTime: format(new Date(time), "HH:mm"),
        max: data.hourly.temperature_2m[i],
        min: data.hourly.temperature_2m[i],
        mean: data.hourly.temperature_2m[i],
      }));
    }

    return data.daily.time.map((date, i) => ({
      date,
      formattedDate: format(new Date(date), "MMM dd"),
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      mean: data.daily.temperature_2m_mean[i],
    }));
  }, [data]);

  const chartConfig = {
    max: { label: "Max Temperature", color: "#ef4444" },
    min: { label: "Min Temperature", color: "#3b82f6" },
    mean: { label: "Mean Temperature", color: "#10b981" },
  };

  const averages = React.useMemo(() => {
    if (chartData.length === 0) return {};
    const count = chartData.length;
    return {
      max: (chartData.reduce((acc, curr) => acc + curr.max, 0) / count).toFixed(
        1
      ),
      min: (chartData.reduce((acc, curr) => acc + curr.min, 0) / count).toFixed(
        1
      ),
      mean: (
        chartData.reduce((acc, curr) => acc + curr.mean, 0) / count
      ).toFixed(1),
    };
  }, [chartData]);

  if (!data?.daily && !data?.hourly) return null;

  const isHourlyData = !!data.hourly;
  const timeKey = isHourlyData ? "formattedTime" : "formattedDate";
  const title = isHourlyData ? "Hourly Temperature" : "Daily Temperature";

  return loading ? (
    <Skeleton className="h-32 w-full" />
  ) : (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {isHourlyData
              ? "Hourly temperature data for the selected day"
              : `Daily temperature data for ${chartData.length} days`}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {Object.entries(chartConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={activeChart === key ? "default" : "outline"}
              onClick={() => setActiveChart(key)}
              className="flex flex-col h-auto p-3"
            >
              <span className="text-xs opacity-70">{config.label}</span>
              <span className="text-lg font-bold">{averages[key]}°C</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey={timeKey}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: "°C", angle: -90, position: "insideLeft" }}
              />
              <Line
                type="monotone"
                dataKey={activeChart}
                stroke={chartConfig[activeChart].color}
                strokeWidth={2}
                dot={{
                  fill: chartConfig[activeChart].color,
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export { WeatherGraph };
