"use client";

import React, { useState } from "react";

const MAX_TIME_UNIT = 500;

const DEFAULT_PROCESS_DATA: Omit<Process, "pid"> = { arrival: "", burst: "" };

const getInitialProcesses = () => [
  { pid: "P1", ...DEFAULT_PROCESS_DATA },
  { pid: "P2", ...DEFAULT_PROCESS_DATA },
  { pid: "P3", ...DEFAULT_PROCESS_DATA },
  { pid: "P4", ...DEFAULT_PROCESS_DATA },
  { pid: "P5", ...DEFAULT_PROCESS_DATA },
];

interface Process {
  pid: string;
  arrival: number | "";
  burst: number | "";
}

interface ProcessResult extends Omit<Process, "arrival" | "burst"> {
  arrival: number;
  burst: number;
  completion: number;
  waiting: number;
  turnaround: number;
  remaining?: number;
}

// FCFS algorithm
function fcfs(processes: { pid: string; arrival: number; burst: number }[]) {
  const procs = processes
    .map((p) => ({ ...p }))
    .sort((a, b) => a.arrival - b.arrival || a.pid.localeCompare(b.pid));

  const done: ProcessResult[] = [];
  let time = 0;
  const timeline: (string | "IDLE")[] = [];

  for (const current of procs) {
    let startTime = time;

    if (current.arrival > time) {
      for (let i = 0; i < current.arrival - time; i++) timeline.push("IDLE");
      startTime = current.arrival;
    }

    for (let i = 0; i < current.burst; i++) timeline.push(current.pid);

    const completionTime = startTime + current.burst;
    time = completionTime;

    done.push({
      ...current,
      completion: completionTime,
      turnaround: completionTime - current.arrival,
      waiting: completionTime - current.arrival - current.burst,
    });
  }

  const compressedTimeline = timeline.reduce(
    (acc: (string | "IDLE")[], current) => {
      if (acc.length === 0 || acc[acc.length - 1] !== current) acc.push(current);
      return acc;
    },
    []
  );

  return { timeline: compressedTimeline, results: done };
}

export default function FCFSSimulator() {
  const [processes, setProcesses] = useState<Process[]>(getInitialProcesses());
  const [results, setResults] = useState<ProcessResult[] | null>(null);
  const [timeline, setTimeline] = useState<(string | "IDLE")[] | null>(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true); // default dark mode

  const updateField = (i: number, field: keyof Process, value: string) => {
    const updated = [...processes];
    setError("");
    if (field === "pid") updated[i].pid = value;
    else {
      if (!/^\d*$/.test(value)) return;
      updated[i][field] = value === "" ? "" : parseInt(value);
    }
    setProcesses(updated);
  };

  const addProcess = () => {
    setProcesses([...processes, { pid: `P${processes.length + 1}`, arrival: "", burst: "" }]);
    setResults(null);
    setTimeline(null);
  };

  const removeProcess = (i: number) => {
    const copy = [...processes];
    copy.splice(i, 1);
    setProcesses(copy.map((p, idx) => ({ ...p, pid: `P${idx + 1}` })));
    setResults(null);
    setTimeline(null);
    setError("");
  };

  const resetProcesses = () => {
    setProcesses(getInitialProcesses());
    setResults(null);
    setTimeline(null);
    setError("");
  };

  const simulate = () => {
    setError("");
    setResults(null);
    setTimeline(null);

    const validProcesses: { pid: string; arrival: number; burst: number }[] = [];
    for (const p of processes) {
      if (!p.pid.trim()) return setError("PID cannot be empty.");
      if (p.arrival === "" || p.burst === "") return setError(`${p.pid}: Arrival & Burst required.`);
      const arrival = Number(p.arrival);
      const burst = Number(p.burst);
      if (isNaN(arrival) || isNaN(burst)) return setError(`${p.pid}: Invalid number.`);
      if (arrival < 0 || burst <= 0) return setError(`${p.pid}: Arrival ≥ 0, Burst ≥ 1.`);
      if (arrival > MAX_TIME_UNIT || burst > MAX_TIME_UNIT) return setError(`${p.pid}: Max ${MAX_TIME_UNIT}.`);
      validProcesses.push({ pid: p.pid, arrival, burst });
    }

    if (!validProcesses.length) return setError("Define at least one process.");
    const out = fcfs(validProcesses);
    setResults(out.results.sort((a, b) => a.pid.localeCompare(b.pid)));
    setTimeline(out.timeline);
  };

  let avgW = 0,
    avgT = 0;
  if (results && results.length > 0) {
    avgW = results.reduce((a, b) => a + b.waiting, 0) / results.length;
    avgT = results.reduce((a, b) => a + b.turnaround, 0) / results.length;
  }

  const bgClass = darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900";
  const sectionBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-black";

  return (
    <main className={`min-h-screen font-mono p-4 ${bgClass}`}>
      {/* Dark/Light Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded font-bold border ${
            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-200 border-gray-400 text-black"
          }`}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <header className="flex flex-col md:flex-row items-center justify-between border-b-2 pb-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center md:text-left">
          FCFS Scheduling Simulator
        </h1>
      </header>

      <section className={`mb-8 p-4 rounded-lg border-2 shadow-md ${sectionBg}`}>
        <h2 className="text-xl font-bold mb-4">Input Parameters</h2>

        {error && (
          <div className="border-2 border-red-600 bg-red-700 p-2 mb-4 rounded text-red-100 font-bold">
            🚨 {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={`min-w-full border-collapse border-2 rounded-md text-sm ${darkMode ? "border-gray-700" : "border-black"}`}>
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-200"}>
              <tr>
                <th className="p-2 border">{`P`}</th>
                <th className="p-2 border">Arrival</th>
                <th className="p-2 border">Burst</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p, i) => (
                <tr key={i} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}>
                  <td className="p-1 border text-center">
                    <input value={p.pid} readOnly className={`w-full rounded text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />
                  </td>
                  <td className="p-1 border text-center">
                    <input
                      type="text"
                      value={p.arrival}
                      onChange={(e) => updateField(i, "arrival", e.target.value)}
                      className={`w-full rounded text-center ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-black"}`}
                    />
                  </td>
                  <td className="p-1 border text-center">
                    <input
                      type="text"
                      value={p.burst}
                      onChange={(e) => updateField(i, "burst", e.target.value)}
                      className={`w-full rounded text-center ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-black"}`}
                    />
                  </td>
                  <td className="p-1 border text-center">
                    <button
                      onClick={() => removeProcess(i)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded w-full"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button onClick={simulate} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full sm:w-auto">
            SIMULATE
          </button>
          <button onClick={addProcess} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full sm:w-auto">
            + Add Process
          </button>
          <button onClick={resetProcesses} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded w-full sm:w-auto">
            Reset
          </button>
        </div>
      </section>

      {results && (
        <section className={`mt-6 p-4 rounded-lg border-2 shadow-md ${sectionBg}`}>
          {timeline && (
            <>
              <h3 className="text-lg font-semibold mb-2">Gantt Chart</h3>
              <div className={`p-2 mb-4 rounded font-mono overflow-x-auto text-sm whitespace-nowrap ${darkMode ? "bg-gray-900 text-green-400 border-gray-700 border-2" : "bg-gray-200 text-green-800 border-black border-2"}`}>
                {timeline.join(" → ")}
              </div>
            </>
          )}

          <h3 className="text-lg font-semibold mb-2">Process Metrics</h3>
          <div className="overflow-x-auto">
            <table className={`min-w-full border-collapse border-2 rounded-md text-sm ${darkMode ? "border-gray-700" : "border-black"}`}>
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-200"}>
                <tr>
                  <th className="p-2 border">P</th>
                  <th className="p-2 border">Arrival</th>
                  <th className="p-2 border">Burst</th>
                  <th className="p-2 border">Completion</th>
                  <th className="p-2 border bg-green-800">Turnaround</th>
                  <th className="p-2 border bg-yellow-800">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.pid} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}>
                    <td className="p-1 border text-center">{p.pid}</td>
                    <td className="p-1 border text-center">{p.arrival}</td>
                    <td className="p-1 border text-center">{p.burst}</td>
                    <td className="p-1 border text-center">{p.completion}</td>
                    <td className="p-1 border text-center bg-green-900">{p.turnaround}</td>
                    <td className="p-1 border text-center bg-yellow-900">{p.waiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`mt-4 p-4 rounded flex flex-col sm:flex-row justify-around gap-2 font-bold text-center ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <p>Avg Waiting Time: <span className="text-red-400">{avgW.toFixed(2)}</span></p>
            <p>Avg Turnaround Time: <span className="text-blue-400">{avgT.toFixed(2)}</span></p>
          </div>
        </section>
      )}
    </main>
  );
}
