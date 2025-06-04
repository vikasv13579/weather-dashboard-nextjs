"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameDay } from "date-fns";
import { Loader } from "lucide-react";

const DynamicWeatherGraph = dynamic(
  () =>
    import("@/components/weather/WeatherGraph").then((mod) => mod.WeatherGraph),
  { ssr: false }
);
const DynamicWeatherTable = dynamic(
  () => import("@/components/weather/WeatherTable"),
  { ssr: false }
);

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [latitudeError, setLatitudeError] = useState("");
  const [longitudeError, setLongitudeError] = useState("");
  const [dateError, setDateError] = useState("");

  const [darkMode, setDarkMode] = useState(true);
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchWeatherData = async () => {
    setLatitudeError("");
    setLongitudeError("");
    setDateError("");
    setError("");

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    const today = new Date();
    let hasError = false;

    if (!latitude || isNaN(latNum) || latNum < -90 || latNum > 90) {
      setLatitudeError("Latitude must be a number between -90 and 90.");
      hasError = true;
    }

    if (!longitude || isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setLongitudeError("Longitude must be a number between -180 and 180.");
      hasError = true;
    }

    if (!startDate || !endDate) {
      setDateError("Both start and end dates are required.");
      hasError = true;
    } else if (startDate > today || endDate > today) {
      setDateError("Dates cannot be in the future.");
      hasError = true;
    } else if (startDate > endDate) {
      setDateError("Start date must be before or equal to end date.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const isSingleDay = isSameDay(startDate, endDate);
      const params = {
        latitude: latNum,
        longitude: lonNum,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        timezone: "auto",
      };

      if (isSingleDay) {
        params.hourly = "temperature_2m";
      } else {
        params.daily =
          "temperature_2m_max,temperature_2m_min,temperature_2m_mean";
      }

      const response = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        { params }
      );
      setWeatherData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (!mounted) return null;

  return (
    <div
      className={`overflow-x-hidden p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Weather Dashboard</h1>
        <Button onClick={toggleDarkMode} className="my-4">
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Button>
      </div>
      <div className="my-4 flex flex-wrap gap-4">
        <div className="flex flex-col">
          <Input
            type="text"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className={`w-[150px] ${
              darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
            }`}
          />
          {latitudeError && (
            <p className="text-sm text-red-500 mt-1">{latitudeError}</p>
          )}
        </div>

        <div className="flex flex-col">
          <Input
            type="text"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className={`w-[150px] ${
              darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
            }`}
          />
          {longitudeError && (
            <p className="text-sm text-red-500 mt-1">{longitudeError}</p>
          )}
        </div>

        <div className="flex flex-col">
          <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[150px] justify-start text-left font-normal cursor-pointer"
              >
                {startDate ? format(startDate, "PPP") : "Select Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 " align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartPopoverOpen(false);
                }}
                disabled={{ after: new Date() }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col">
          <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[150px] justify-start text-left font-normal cursor-pointer"
              >
                {endDate ? format(endDate, "PPP") : "Select End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setEndPopoverOpen(false);
                }}
                disabled={{ after: new Date() }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Button
            className="cursor-pointe bg-gray-700 text-white"
            onClick={fetchWeatherData}
          >
            {loading && <Loader className="animate-spin mr-2" />}
            <span>Fetch Weather</span>
          </Button>
        </div>
      </div>
      {dateError && <p className="text-sm text-red-500 mb-4">{dateError}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {weatherData && mounted && (
        <>
          <DynamicWeatherGraph data={weatherData} loading={loading} />
          <DynamicWeatherTable data={weatherData} loading={loading} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
