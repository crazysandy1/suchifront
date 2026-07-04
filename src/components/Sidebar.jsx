import React from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { name: "Food Items", key: "foodItems" },
    { name: "Food Journey", key: "foodJourney" },
    { name: "Users", key: "users" },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`text-left p-2 rounded ${
              activeTab === tab.key ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
