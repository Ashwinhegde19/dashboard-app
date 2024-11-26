import { useEffect } from "react";

const RoleModal = ({
  showModal,
  role,
  isEditing,
  onClose,
  onSave,
  onRoleChange,
  onDescriptionChange,
  onPermissionToggle,
}) => {
  useEffect(() => {
    if (showModal) {
      // Reset form or perform any necessary actions when modal is shown
    }
  }, [showModal]);

  const permissions = ["read", "write", "delete"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(role);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showModal ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Role" : "Create Role"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role Name</label>
            <input
              type="text"
              value={role.name}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={role.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Permissions</label>
            <div className="space-y-2">
              {permissions.map((permission) => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={role.permissions.includes(permission)}
                    onChange={() => onPermissionToggle(permission)}
                    className="mr-2"
                  />
                  {permission.charAt(0).toUpperCase() + permission.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? "Update Role" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;