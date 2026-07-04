import React from "react";

export default function Blocks() {
  const blocks = [
    { id: 1, hash: "0xabc123...", timestamp: "2025-10-04 12:00" },
    { id: 2, hash: "0xdef456...", timestamp: "2025-10-04 12:05" },
    { id: 3, hash: "0xghi789...", timestamp: "2025-10-04 12:10" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Blockchain Blocks</h1>
      <table className="w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Block #</th>
            <th className="p-3 text-left">Hash</th>
            <th className="p-3 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.id} className="border-t">
              <td className="p-3">{block.id}</td>
              <td className="p-3 font-mono text-sm">{block.hash}</td>
              <td className="p-3">{block.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
