"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { Input } from "@nextui-org/input";
import { format } from "date-fns";
import { Calendar } from "react-calendar";
import { Divider } from "@nextui-org/divider";

import "react-calendar/dist/Calendar.css";
import { Value } from "react-calendar/src/shared/types.js";

const UpdateForm = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [nnoInput, setNnoInput] = useState("");
  const [column, setColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Custom styles for the calendar
  const calendarStyles = `
    .react-calendar { 
      border: none;
      font-family: inherit;
    }
    .react-calendar__tile {
      color: #1a1a1a;
      font-weight: 500;
      padding: 10px;
    }
    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus {
      background-color: #e6efff;
    }
    .react-calendar__tile--active {
      background-color: #3b82f6 !important;
      color: white !important;
    }
    .react-calendar__tile--now {
      background-color: #fff3e6;
    }
    .react-calendar__month-view__weekdays__weekday {
      color: #4b5563;
      font-weight: 600;
    }
    .react-calendar__navigation button:enabled:hover,
    .react-calendar__navigation button:enabled:focus {
      background-color: #e6efff;
    }
    .react-calendar__navigation button {
      color: #1a1a1a;
      font-weight: 600;
    }
    .react-calendar__navigation__label {
      color: #1a1a1a;
      font-weight: 600;
    }
  `;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns = [
    { value: "Script2_ReceiveDate", label: "Script 2 Receive Date" },
    { value: "Script2_DueDate", label: "Script 2 Due Date" },
    { value: "Script_DueDate", label: "Script Due Date" },
    { value: "Script_ReceiveDate", label: "Script Receive Date" },
  ];

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setDate(value);
      setIsCalendarOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!nnoInput || !column) {
      setError("NNO numbers and column selection are required");
      setLoading(false);
      return;
    }

    const nnoNumbers = nnoInput
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));

    if (nnoNumbers.length === 0) {
      setError("Please enter valid NNO numbers");
      setLoading(false);
      return;
    }

    const formattedDate = date ? format(date, "dd-MM-yyyy") : null;

    try {
      const response = await fetch("http://127.0.0.1:5000/ess/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          nno: nnoNumbers,
          column: column,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update");
      }

      setSuccess("Updated successfully");
      setNnoInput("");
      setColumn("");
      setDate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center ">
      <style>{calendarStyles}</style>
      <Card className="w-full max-w-3xl mx-auto shadow-lg border border-blue-100">
        <CardHeader className="flex flex-col gap-3 items-center bg-blue-50 p-16">
          <h1 className="text-3xl font-bold text-blue-900">Update ESS Data</h1>
          <p className="text-base text-blue-600">
            Complete all steps to update the data
          </p>
        </CardHeader>
        <Divider className="bg-blue-100" />
        <CardBody className="gap-8 p-8 bg-white">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 w-full max-w-2xl mx-auto"
          >
            {/* Select Column section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold shadow-sm">
                  1
                </div>
                <h2 className="text-xl font-semibold text-blue-900">
                  Select Column
                </h2>
              </div>
              <Select
                label="Column to Update"
                placeholder="Choose the column to update"
                selectedKeys={column ? [column] : []}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full"
                classNames={{
                  trigger:
                    "bg-blue-50 hover:bg-blue-100 transition-colors h-14",
                  value: "text-blue-900",
                  popoverContent: "text-blue-900",
                }}
                size="lg"
              >
                {columns.map((col) => (
                  <SelectItem key={col.value} value={col.value}>
                    {col.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* NNO Numbers section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold shadow-sm">
                  2
                </div>
                <h2 className="text-xl font-semibold text-blue-900">
                  Enter NNO Numbers
                </h2>
              </div>
              <Input
                type="text"
                value={nnoInput}
                onChange={(e) => setNnoInput(e.target.value)}
                placeholder="Enter NNO numbers, separated by commas"
                description="Example: 1234, 5678, 9012"
                classNames={{
                  input: "bg-blue-50 h-14",
                  inputWrapper:
                    "bg-blue-50 hover:bg-blue-100 transition-colors h-14",
                }}
                size="lg"
              />
            </div>

            {/* Date Selection section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold shadow-sm">
                  3
                </div>
                <h2 className="text-xl font-semibold text-blue-900">
                  Select Date
                </h2>
              </div>
              <div className="relative w-full">
                <div className="flex gap-2">
                  <Button
                    ref={buttonRef}
                    variant="bordered"
                    onPress={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 transition-colors border-blue-200 h-14"
                  >
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                  <Button
                    variant="flat"
                    onPress={() => setDate(null)}
                    className="bg-gray-100 hover:bg-gray-200 transition-colors h-14"
                  >
                    Clear Date
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 shadow-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center text-green-600 shadow-sm">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors shadow-lg font-semibold text-lg h-14 text-white"
              isLoading={loading}
              size="lg"
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Centered Calendar Modal */}
      {isCalendarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCalendarOpen(false)}
          />
          <div
            ref={calendarRef}
            className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-2xl rounded-lg p-6"
          >
            <Calendar
              onChange={handleDateChange}
              value={date}
              className="border-none"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateForm;
