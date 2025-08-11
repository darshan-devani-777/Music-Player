import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserData, setEditingUserData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false); 

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("auth/users/get-all-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Error fetching users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startEdit = (user) => {
    setEditingUserId(user._id);

    if (user.role === "admin") {
      setIsEditingAdmin(true); 
      setEditingUserData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "admin",
        password: "",
      });
    } else {
      setIsEditingAdmin(false); 
      setEditingUserData({
        name: "",
        email: "",
        role: user.role || "",
        password: "",
      });
      setNewRole(user.role || "");
    }

    setShowUserForm(true);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setNewRole("");
    setEditingUserData({ name: "", email: "", role: "", password: "" });
    setIsEditingAdmin(false); 
    setShowUserForm(false);
  };

  // EDIT USER ROLE
  const handleEditRole = async (userId) => {
    if (!newRole && !editingUserData.role) {
      toast.error("Please select a role.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/auth/users/update-user/${userId}`,
        { role: newRole || editingUserData.role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User Role Updated Successfully...");
      cancelEdit();
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
      toast.error("Error updating role.");
    }
  };

  // EDIT ADMIN DETAILS
  const handleEditAdmin = async (userId) => {
    if (
      !editingUserData.name ||
      !editingUserData.email ||
      !editingUserData.role
    ) {
      toast.error("Please fill name, email and role (password optional)");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: editingUserData.name,
        email: editingUserData.email,
        role: editingUserData.role,
      };
      if (editingUserData.password?.trim()) {
        payload.password = editingUserData.password;
      }

      await api.put(`/auth/users/update-user/${userId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && currentUser._id === userId) {
        const updatedUser = {
          ...currentUser,
          name: editingUserData.name,
          email: editingUserData.email,
          role: editingUserData.role,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }

      toast.success("Admin Details Updated Successfully...");
      cancelEdit();
      fetchUsers();
    } catch (err) {
      console.error("Failed to update admin details:", err);
      toast.error("Error updating admin details.");
    }
  };

  // HANDLE DELETE
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

      toast.success("User Deleted Successfully...");
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.loginType?.toLowerCase().includes(query)
    );
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      {/* Search Header */}
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-2xl font-sans font-semibold underline">
          User Management
        </h2>
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center pr-3 border-r border-gray-300 text-gray-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name, email, role or login type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-14 pr-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-purple-400 !placeholder:text-gray-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="uppercase text-xs">
            <tr className="bg-gray-200 text-left text-gray-700">
              <th className="p-3 border border-gray-300">ID</th>
              <th className="p-3 border border-gray-300">Name</th>
              <th className="p-3 border border-gray-300">Email</th>
              <th className="p-3 border border-gray-300">Role</th>
              <th className="p-3 border border-gray-300">Login Type</th>
              <th className="p-3 border border-gray-300">Created At</th>
              <th className="p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Users Not Found.
                </td>
              </tr>
            ) : (
              currentUsers.map((user, index) => (
                <tr key={user._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="p-3 border border-gray-300 text-sm">
                    {(currentPage - 1) * usersPerPage + index + 1}.
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {user.name || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {user.email || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {user.role || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {user.loginType || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt)
                          .toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", " ,")
                      : "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={() => startEdit(user)}
                      className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition mr-2 cursor-pointer duration-300"
                    >
                      {user.role === "admin" ? "Edit Profile" : "Edit Role"}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition cursor-pointer duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Edit Form */}
        {showUserForm && (
          <div className="fixed inset-0 bg-white/0 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 border border-purple-500">
              <h2 className="text-2xl font-semibold mb-4 text-center text-purple-500 underline">
                {isEditingAdmin ? "Edit Admin" : "Edit Role"}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  isEditingAdmin
                    ? handleEditAdmin(editingUserId)
                    : handleEditRole(editingUserId);
                }}
              >
                {isEditingAdmin && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editingUserData.name}
                        onChange={(e) =>
                          setEditingUserData({
                            ...editingUserData,
                            name: e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editingUserData.email}
                        onChange={(e) =>
                          setEditingUserData({
                            ...editingUserData,
                            email: e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">
                    Role
                  </label>
                  <select
                    value={editingUserData.role || newRole}
                    onChange={(e) => {
                      setEditingUserData({
                        ...editingUserData,
                        role: e.target.value,
                      });
                      setNewRole(e.target.value);
                    }}
                    className="w-full border px-3 py-2 rounded text-sm"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {isEditingAdmin && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={editingUserData.password}
                      onChange={(e) =>
                        setEditingUserData({
                          ...editingUserData,
                          password: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep current"
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm transition duration-300 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm transition duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const isCurrent = page === currentPage;
            const isNearCurrent = Math.abs(currentPage - page) <= 1;

            if (
              totalPages <= 3 ||
              page === 1 ||
              page === totalPages ||
              isCurrent ||
              isNearCurrent
            ) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    isCurrent
                      ? "bg-purple-600 text-white"
                      : "bg-gray-300 text-gray-500"
                  } hover:bg-purple-600 hover:text-white transition duration-300 cursor-pointer`}
                >
                  {page}
                </button>
              );
            }

            if (
              (page === currentPage - 2 && currentPage > 3) ||
              (page === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return (
                <span key={page} className="py-2 text-gray-500">
                  .....
                </span>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
