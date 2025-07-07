import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // FETCH USER
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("auth/users/get-all-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Error fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // EDIT USER ROLE
  const handleEditRole = async (userId) => {
    if (!newRole) {
      alert("Please select a role");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/auth/users/update-role/${userId}`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("User Role Updated Successfully...");
      setEditingUserId(null);
      setNewRole("");
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Error updating role");
    }
  };

  // DELETE USER
  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`auth/users/delete-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user");
    }
  };

  // FILTER USER
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.loginType?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-7 underline text-center">
        User Management
      </h2>

      <div className="mb-5 text-center">
        <input
          type="text"
          placeholder="Search by name, email, role, or login type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-blue-500 focus:outline-none focus:border-red-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-white">
              <th className="p-3 border dark:border-gray-600">Name</th>
              <th className="p-3 border dark:border-gray-600">Email</th>
              <th className="p-3 border dark:border-gray-600">Role</th>
              <th className="p-3 border dark:border-gray-600">Login Type</th>
              <th className="p-3 border dark:border-gray-600">Created At</th>
              <th className="p-3 border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Users Not Found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="p-3 border dark:border-gray-600 text-white">
                    {user.name}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {user.email}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {user.role}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {user.loginType}
                  </td>
                  <td className="p-3 border dark:border-gray-600 text-gray-400 text-sm">
                    {new Date(user.createdAt)
                      .toLocaleString()
                      .replace(",", " , ")}
                  </td>
                  <td className="p-3 border dark:border-gray-600">
                    {/* Edit Role Button */}
                    <button
                      onClick={() => {
                        setEditingUserId(user._id);
                        setNewRole(user.role);
                      }}
                      className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition duration-300 mr-2 cursor-pointer"
                    >
                      Edit Role
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition duration-300 cursor-pointer"
                    >
                      Delete
                    </button>

                    {/* Conditionally show role editing form */}
                    {editingUserId === user._id && (
                      <div className="mt-2">
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="border px-2 py-1 text-sm rounded mr-2 text-white cursor-pointer"
                        >
                          <option value="">Select Role</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          onClick={() => handleEditRole(user._id)}
                          className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition duration-300 mr-1 cursor-pointer"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditingUserId(null)}
                          className="bg-gray-500 text-white text-sm px-3 py-1 rounded hover:bg-gray-700 transition duration-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
