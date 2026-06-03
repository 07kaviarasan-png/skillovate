import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  status: string;
};

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "pending" ? "/users/pending" : "/users/";
      const res = await api.get(endpoint);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await api.put(`/users/${id}/${action}`);
      if (activeTab === "pending") {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        // If in 'all' tab, just refetch to get updated status
        fetchUsers();
      }
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Super Admin Dashboard</h1>
      <p className="text-gray-500">Manage all portal accounts and requests here.</p>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          All Users
        </button>
      </div>

      <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">
            {activeTab === "pending" ? "Pending Approvals" : "All Users"} ({users.length})
          </h2>
          <button onClick={fetchUsers} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading requests...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-1">There are no {activeTab === "pending" ? "pending" : ""} accounts to review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 capitalize border border-blue-100">
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${
                        user.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        user.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {user.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(user.id, "reject")}
                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(user.id, "approve")}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                          >
                            Approve
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
