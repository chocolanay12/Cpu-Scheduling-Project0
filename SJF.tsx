"use client";

import React, { useState } from "react";

interface Process {
  pid: string;
  arrival: number | "";
  burst: number | "";
}

interface ProcessResult {
  pid: string;
  arrival: number;
  burst: number;
  completion: number;
  turnaround: number;
  waiting: number;
}

function simulateSJFAlgorithm(processes: Process[], preemptive: boolean) {
  const validProcesses: (ProcessResult & { remaining?: number })[] = processes.map((p) => ({
    pid: p.pid,
    arrival: Number(p.arrival),
    burst: Number(p.burst),
    completion: 0,
    turnaround: 0,
    waiting: 0,
    remaining: Number(p.burst),
  }));

  const timeline: (string | "IDLE")[] = [];
  const results: ProcessResult[] = [];
  let time = 0;
  const list = [...validProcesses];

  while (list.length > 0) {
    const available = list.filter((p) => p.arrival <= time);

    if (available.length === 0) {
      timeline.push("IDLE");
      time++;
      continue;
    }

    let current: typeof list[0];

    if (preemptive) {
      available.sort((a, b) => a.remaining! - b.remaining! || a.arrival - b.arrival);
      current = available[0];
      current.remaining!--;
      timeline.push(current.pid);
      time++;

      if (current.remaining === 0) {
        current.completion = time;
        current.turnaround = current.completion - current.arrival;
        current.waiting = current.turnaround - current.burst;
        results.push({ ...current });
        list.splice(list.indexOf(current), 1);
      }
    } else {
      available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
      current = available[0];

      for (let i = 0; i < current.burst; i++) timeline.push(current.pid);
      time = Math.max(time, current.arrival) + current.burst;

      current.completion = time;
      current.turnaround = current.completion - current.arrival;
      current.waiting = current.turnaround - current.burst;

      results.push({ ...current });
      list.splice(list.indexOf(current), 1);
    }
  }

  return { results, timeline };
}

export default function SJFSimulator() {
  const [processes, setProcesses] = useState<Process[]>([{ pid: "P1", arrival: "", burst: "" }]);
  const [preemptive, setPreemptive] = useState(false);
  const [results, setResults] = useState<ProcessResult[] | null>(null);
  const [timeline, setTimeline] = useState<(string | "IDLE")[] | null>(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true); // <-- Dark mode state

  const updateField = (index: number, field: "arrival" | "burst", value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...processes];
    updated[index][field] = value === "" ? "" : Number(value);
    setProcesses(updated);
  };

  const addProcess = () => {
    setProcesses([...processes, { pid: `P${processes.length + 1}`, arrival: "", burst: "" }]);
  };

  const removeProcess = (index: number) => {
    const updated = processes.filter((_, i) => i !== index).map((p, i) => ({ ...p, pid: `P${i + 1}` }));
    setProcesses(updated);
  };

  const reset = () => {
    setProcesses([{ pid: "P1", arrival: "", burst: "" }]);
    setResults(null);
    setTimeline(null);
    setError("");
  };

  const simulate = () => {
    setError("");
    if (processes.some((p) => p.arrival === "" || p.burst === "")) {
      setError("All processes must have arrival and burst times.");
      return;
    }

    const output = simulateSJFAlgorithm(processes, preemptive);
    setResults(output.results);
    setTimeline(output.timeline);
  };

  const avgW = results ? results.reduce((sum, p) => sum + p.waiting, 0) / results.length : 0;
  const avgT = results ? results.reduce((sum, p) => sum + p.turnaround, 0) / results.length : 0;

  return (
    <main className={`${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"} min-h-screen  md:p-12 font-mono`}>
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}  shadow-lg border rounded-md`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            SJF Scheduling {preemptive ? "(Preemptive)" : "(Non-Preemptive)"}
          </h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-yellow-500 text-gray-900 px-3 py-1 rounded font-bold hover:bg-yellow-400"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={preemptive} onChange={(e) => setPreemptive(e.target.checked)} />
            Preemptive (SRTF)
          </label>
        </div>

        {error && (
          <div className="bg-red-600 border border-red-800 p-2 mb-4 text-red-100 font-bold rounded">
            {error}
          </div>
        )}

        <table className={`w-full border mb-4 ${darkMode ? "border-gray-600" : "border-gray-400"}`}>
          <thead className={darkMode ? "bg-gray-700 border-b border-gray-600" : "bg-gray-200 border-b border-gray-300"}>
            <tr>
              <th className="p-2 border">PID</th>
              <th className="p-2 border">Arrival</th>
              <th className="p-2 border">Burst</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr key={i} className={darkMode ? "border-b border-gray-700" : "border-b border-gray-300"}>
                <td className="p-2 border text-center">{p.pid}</td>
                <td className="p-2 border text-center">
                  <input
                    type="text"
                    value={p.arrival}
                    onChange={(e) => updateField(i, "arrival", e.target.value)}
                    className={`w-20 text-center border rounded px-1 ${darkMode ? "bg-gray-900 border-gray-500 text-gray-200" : "bg-gray-100 border-gray-400 text-gray-900"}`}
                  />
                </td>
                <td className="p-2 border text-center">
                  <input
                    type="text"
                    value={p.burst}
                    onChange={(e) => updateField(i, "burst", e.target.value)}
                    className={`w-20 text-center border rounded px-1 ${darkMode ? "bg-gray-900 border-gray-500 text-gray-200" : "bg-gray-100 border-gray-400 text-gray-900"}`}
                  />
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => removeProcess(i)}
                    className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
                  >
                    REMOVE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4 mb-4 flex-wrap">
          <button onClick={addProcess} className="bg-blue-600 text-white px-4 py-2 font-bold rounded hover:bg-blue-700">
            + Add Process
          </button>
          <button onClick={simulate} className="bg-green-600 text-white px-4 py-2 font-bold rounded hover:bg-green-700">
            SIMULATE
          </button>
          <button onClick={reset} className="bg-gray-600 text-white px-4 py-2 font-bold rounded hover:bg-gray-500">
            Reset
          </button>
        </div>

        {results && timeline && (
          <>
            <h3 className="text-xl font-bold mb-2">Gantt Chart</h3>
            <div className={`p-2 overflow-x-auto whitespace-nowrap font-mono text-sm border mb-4 rounded ${darkMode ? "bg-gray-900 text-green-400 border-gray-700" : "bg-gray-100 text-green-700 border-gray-400"}`}>
              {timeline.join(" → ")}
            </div>

            <h3 className="text-xl font-bold mb-2">Results</h3>
            <table className={`w-full border ${darkMode ? "border-gray-600" : "border-gray-400"}`}>
              <thead className={darkMode ? "bg-gray-700 border-b border-gray-600" : "bg-gray-200 border-b border-gray-300"}>
                <tr>
                  <th className="p-2 border">PID</th>
                  <th className="p-2 border">Arrival</th>
                  <th className="p-2 border">Burst</th>
                  <th className="p-2 border">Completion</th>
                  <th className="p-2 border bg-green-800 text-green-200">Turnaround</th>
                  <th className="p-2 border bg-yellow-800 text-yellow-200">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.pid} className={darkMode ? "border-b border-gray-700" : "border-b border-gray-300"}>
                    <td className="p-2 border text-center">{p.pid}</td>
                    <td className="p-2 border text-center">{p.arrival}</td>
                    <td className="p-2 border text-center">{p.burst}</td>
                    <td className="p-2 border text-center">{p.completion}</td>
                    <td className="p-2 border bg-green-800 text-green-200 text-center">{p.turnaround}</td>
                    <td className="p-2 border bg-yellow-800 text-yellow-200 text-center">{p.waiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-around mt-4 text-xl font-bold flex-wrap gap-4">
              <p>
                Avg Waiting: <span className="text-red-400">{avgW.toFixed(2)}</span>
              </p>
              <p>
                Avg Turnaround: <span className="text-blue-400">{avgT.toFixed(2)}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
