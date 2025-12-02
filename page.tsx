"use client";

import React, { useState } from "react";
import FCFS from "./components/FCFS";
import SJF from "./components/SJF";

export default function App() {
  const [selectedAlgo, setSelectedAlgo] = useState("FCFS");

  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-12 font-mono text-gray-100">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 border-b-2 border-gray-700 pb-2 text-center">
        CPU Scheduling Simulator
      </h1>

      {/* Algorithm Switch Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-4 justify-center mb-6">
        {["FCFS", "SJF"].map((algo) => (
          <button
            key={algo}
            onClick={() => setSelectedAlgo(algo)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 font-bold rounded-md border-2 text-sm sm:text-base
              ${
                selectedAlgo === algo
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
              } transition-colors duration-200`}
          >
            {algo}
          </button>
        ))}
      </div>

      {/* Render selected algorithm */}
      <div className="max-w-full sm:max-w-4xl md:max-w-5xl mx-auto overflow-x-auto">
        {selectedAlgo === "FCFS" && <FCFS />}
        {selectedAlgo === "SJF" && <SJF />}
      </div>
    </main>
  );
}
