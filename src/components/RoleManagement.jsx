import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import RoleModal from "./RoleModal";
import { FiEdit2, FiTrash2, FiUserPlus, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import ConfirmationDialog from "./ConfirmationDialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const RoleManagement = () => {
  const [state, setState] = useState({
    roles: [],
    showModal: false,
    currentRole: { name: "", description: "", permissions: [] },
    isEditing: false,
    loading: true,
    searchTerm: "",
    sortConfig: { key: "name", direction: "asc" },
    showConfirmation: false,
    roleToDelete: null,
    currentPage: 1,
    rolesPerPage: 10,
    selectedRoles: [],
    activityLogs: [],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await api.getRoles();
      setState((prevState) => ({
        ...prevState,
        roles: data,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching roles:", error);
      setState((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const filteredRoles = useMemo(() => {
    let filtered = state.roles;

    if (state.searchTerm) {
      filtered = filtered.filter((role) =>
        role.name.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    if (state.sortConfig.key) {
      filtered = filtered.sort((a, b) => {
        if (a[state.sortConfig.key] < b[state.sortConfig.key]) {
          return state.sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[state.sortConfig.key] > b[state.sortConfig.key]) {
          return state.sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [state.roles, state.searchTerm, state.sortConfig]);

  const handleSort = (key) => {
    setState((prevState) => ({
      ...prevState,
      sortConfig: {
        key,
        direction:
          prevState.sortConfig.key === key && prevState.sortConfig.direction === "asc"
            ? "desc"
            : "asc",
      },
    }));
  };

  const handleSave = async (formData) => {
    try {
      if (state.isEditing && state.currentRole._id) {
        const updatedRole = await api.updateRole(state.currentRole._id, formData);
        setState((prevState) => ({
          ...prevState,
          roles: prevState.roles.map((role) =>
            role._id === state.currentRole._id ? updatedRole : role
          ),
          showModal: false,
          currentRole: { name: "", description: "", permissions: [] },
        }));
        toast.success("Role updated successfully!");
        logActivity(`Updated role: ${updatedRole.name}`);
      } else {
        const newRole = await api.createRole(formData);
        setState((prevState) => ({
          ...prevState,
          roles: [...prevState.roles, newRole],
          showModal: false,
          currentRole: { name: "", description: "", permissions: [] },
        }));
        toast.success("Role created successfully!");
        logActivity(`Created new role: ${newRole.name}`);
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Error saving role");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteRole(state.roleToDelete._id);
      setState((prevState) => ({
        ...prevState,
        roles: prevState.roles.filter((role) => role._id !== state.roleToDelete._id),
        showConfirmation: false,
        roleToDelete: null,
      }));
      toast.success("Role deleted successfully!");
      logActivity(`Deleted role: ${state.roleToDelete.name}`);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Error deleting role");
    }
  };

  const handleAddNew = () => {
    setState((prevState) => ({
      ...prevState,
      currentRole: { name: "", description: "", permissions: [] },
      isEditing: false,
      showModal: true,
    }));
  };

  const handleEdit = (role) => {
    setState((prevState) => ({
      ...prevState,
      currentRole: role,
      isEditing: true,
      showModal: true,
    }));
  };

  const handleRoleNameChange = (name) => {
    setState((prevState) => ({
      ...prevState,
      currentRole: { ...prevState.currentRole, name },
    }));
  };

  const handleRoleDescriptionChange = (description) => {
    setState((prevState) => ({
      ...prevState,
      currentRole: { ...prevState.currentRole, description },
    }));
  };

  const togglePermission = (permission) => {
    setState((prevState) => ({
      ...prevState,
      currentRole: {
        ...prevState.currentRole,
        permissions: prevState.currentRole.permissions.includes(permission)
          ? prevState.currentRole.permissions.filter((p) => p !== permission)
          : [...prevState.currentRole.permissions, permission],
      },
    }));
  };

  const handleConfirmDelete = (role) => {
    setState((prevState) => ({
      ...prevState,
      roleToDelete: role,
      showConfirmation: true,
    }));
  };

  const handleSelectRole = (roleId) => {
    setState((prevState) => ({
      ...prevState,
      selectedRoles: prevState.selectedRoles.includes(roleId)
        ? prevState.selectedRoles.filter((id) => id !== roleId)
        : [...prevState.selectedRoles, roleId],
    }));
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(state.selectedRoles.map((roleId) => api.deleteRole(roleId)));
      setState((prevState) => ({
        ...prevState,
        roles: prevState.roles.filter((role) => !prevState.selectedRoles.includes(role._id)),
        selectedRoles: [],
      }));
      toast.success("Selected roles deleted successfully!");
      logActivity(`Deleted selected roles`);
    } catch (error) {
      console.error("Error deleting roles:", error);
      toast.error("Error deleting roles");
    }
  };

  const handleExport = (format) => {
    if (format === "excel") {
      const ws = XLSX.utils.json_to_sheet(state.roles);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Roles");
      XLSX.writeFile(wb, "roles.xlsx", { bookType: "xlsx", type: "binary" });
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.autoTable({
        head: [["Role Name", "Description", "Permissions"]],
        body: state.roles.map((role) => [
          role.name,
          role.description,
          role.permissions.join(", "),
        ]),
      });
      doc.save("roles.pdf");
    }
  };

  const logActivity = (message) => {
    setState((prevState) => ({
      ...prevState,
      activityLogs: [
        ...prevState.activityLogs,
        { message, timestamp: new Date().toLocaleString() },
      ],
    }));
  };

  const indexOfLastRole = state.currentPage * state.rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - state.rolesPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);

  const paginate = (pageNumber) => {
    setState((prevState) => ({
      ...prevState,
      currentPage: pageNumber,
    }));
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <div className="flex space-x-2">
          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddNew}
          >
            <FiUserPlus className="mr-2" />
            Add New Role
          </button>
          {state.selectedRoles.length > 0 && (
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
          placeholder="Search by role name"
          value={state.searchTerm}
          onChange={(e) => setState((prevState) => ({ ...prevState, searchTerm: e.target.value }))}
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
                    setSelectedRoles(
                      e.target.checked ? currentRoles.map((role) => role._id) : []
                    )
                  }
                  checked={state.selectedRoles.length === currentRoles.length}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Role Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("description")}
              >
                Description
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("permissions")}
              >
                Permissions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRoles.map((role) => (
              <tr key={role._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={state.selectedRoles.includes(role._id)}
                    onChange={() => handleSelectRole(role._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{role.permissions.join(", ")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    onClick={() => handleEdit(role)}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleConfirmDelete(role)}
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
            {Array.from({ length: Math.ceil(filteredRoles.length / state.rolesPerPage) }, (_, i) => (
              <li key={i} className="mx-1">
                <button
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 rounded ${state.currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
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
          {state.activityLogs.map((log, index) => (
            <li key={index} className="mb-2">
              <span className="font-semibold">{log.timestamp}</span>: {log.message}
            </li>
          ))}
        </ul>
      </div>

      <RoleModal
        showModal={state.showModal}
        role={state.currentRole}
        isEditing={state.isEditing}
        onClose={() => setState((prevState) => ({ ...prevState, showModal: false }))}
        onSave={handleSave}
        onRoleChange={handleRoleNameChange}
        onDescriptionChange={handleRoleDescriptionChange}
        onPermissionToggle={togglePermission}
      />

      <ConfirmationDialog
        show={state.showConfirmation}
        title="Delete Role"
        message="Are you sure you want to delete this role?"
        onConfirm={handleDelete}
        onCancel={() => setState((prevState) => ({ ...prevState, showConfirmation: false }))}
      />
    </div>
  );
};

export default RoleManagement;