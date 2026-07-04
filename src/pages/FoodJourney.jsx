// src/pages/FoodJourney.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function FoodJourney() {
  const [journeyData, setJourneyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJourney();
  }, []);

  const fetchJourney = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("Food Journey").select("*");
      if (error) throw new Error(error.message);
      setJourneyData(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">Loading Food Journey...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl font-semibold">Error: {error}</p>
      </div>
    );

  if (journeyData.length === 0)
    return (
      <p className="text-center text-gray-500 py-6">No Food Journey data available.</p>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">Food Journey</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {journeyData.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <p>
              <span className="font-semibold">ID:</span> {item.id}
            </p>
            <p>
              <span className="font-semibold">Food Item ID:</span> {item.food_item_id}
            </p>
            <p>
              <span className="font-semibold">Checkpoint:</span> {item.checkpoint}
            </p>
            <p>
              <span className="font-semibold">Timestamp:</span>{" "}
              {new Date(item.timestamp).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {item.status}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
