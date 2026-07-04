// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("Users").select("*");
    if (error) console.error("Error fetching Users:", error.message);
    else setUsers(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Users</h1>
      <table className="w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{u.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
