import React from "react";

export default function Table({ headers, data, keys, emptyMessage }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th key={header} className="p-2 text-left">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row) => (
              <tr key={row.id} className="border-t">
                {keys.map((key) => (
                  <td key={key} className="p-2">{row[key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="p-2 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
