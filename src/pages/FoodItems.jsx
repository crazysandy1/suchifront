// Example: src/pages/FoodItems.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function FoodItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    const { data, error } = await supabase
      .from("Food Items")  // exact table name
      .select("*");

    if (error) {
      console.error("Error fetching Food Items:", error.message);
    } else {
      setItems(data);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Food Items</h1>
      <table className="w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Origin</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.id}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.origin}</td>
              <td className="p-3">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
