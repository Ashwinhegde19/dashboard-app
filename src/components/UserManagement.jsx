import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import UserModal from "./UserModal";
import { FiEdit2, FiTrash2, FiUserPlus, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import ConfirmationDialog from "./ConfirmationDialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    role: "User",
    status: "active",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([api.getUsers(), api.getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filtered = filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handleSave = async (formData) => {
    try {
      if (isEditing && currentUser._id) {
        const updatedUser = await api.updateUser(currentUser._id, formData);
        setUsers(
          users.map((user) =>
            user._id === currentUser._id ? updatedUser : user
          )
        );
        toast.success("User updated successfully!");
        logActivity(`Updated user: ${updatedUser.name}`);
      } else {
        const newUser = await api.createUser(formData);
        setUsers([...users, newUser]);
        toast.success("User created successfully!");
        logActivity(`Created new user: ${newUser.name}`);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Error saving user");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUser(userToDelete._id);
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      toast.success("User deleted successfully!");
      logActivity(`Deleted user: ${userToDelete.name}`);
      setShowConfirmation(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  const handleAddNew = () => {
    setCurrentUser({ name: "", email: "", role: "User", status: "active" });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleConfirmDelete = (user) => {
    setUserToDelete(user);
    setShowConfirmation(true);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(selectedUsers.map((userId) => api.deleteUser(userId)));
      setUsers(users.filter((user) => !selectedUsers.includes(user._id)));
      toast.success("Selected users deleted successfully!");
      logActivity(`Deleted selected users`);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Error deleting users");
    }
  };

  const handleExport = (format) => {
    if (format === "excel") {
      const ws = XLSX.utils.json_to_sheet(users);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "users.xlsx", { bookType: "xlsx", type: "binary" });
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.autoTable({
        head: [["Name", "Email", "Role", "Status", "Created At"]],
        body: users.map((user) => [
          user.name,
          user.email,
          user.role,
          user.status,
          new Date(user.createdAt).toLocaleDateString(),
        ]),
      });
      doc.save("users.pdf");
    }
  };

  const logActivity = (message) => {
    setActivityLogs((prevLogs) => [
      ...prevLogs,
      { message, timestamp: new Date().toLocaleString() },
    ]);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddNew}
          >
            <FiUserPlus className="mr-2" />
            Add New User
          </button>
          {selectedUsers.length > 0 && (
            <button
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleBatchDelete}
            >
              <FiTrash2 className="mr-2" />
              Delete Selected
            </button>
          )}
          <button
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => handleExport("excel")}
          >
            <FiDownload className="mr-2" />
            Export to Excel
          </button>
          <button
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => handleExport("pdf")}
          >
            <FiDownload className="mr-2" />
            Export to PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded mb-2 md:mb-0"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedUsers(
                      e.target.checked ? currentUsers.map((user) => user._id) : []
                    )
                  }
                  checked={selectedUsers.length === currentUsers.length}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    onClick={() => handleEdit(user)}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleConfirmDelete(user)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        <nav>
          <ul className="flex list-none">
            {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
              <li key={i} className="mx-1">
                <button
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-bold mb-4">Activity Logs</h2>
        <ul>
          {activityLogs.map((log, index) => (
            <li key={index} className="mb-2">
              <span className="font-semibold">{log.timestamp}</span>: {log.message}
            </li>
          ))}
        </ul>
      </div>

      <UserModal
        showModal={showModal}
        user={currentUser}
        roles={roles}
        isEditing={isEditing}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

      <ConfirmationDialog
        show={showConfirmation}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default UserManagement;