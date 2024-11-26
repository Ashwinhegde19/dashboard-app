import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../schemas/userSchema";

const UserModal = ({
  showModal,
  user,
  roles,
  isEditing,
  onClose,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  });

  useEffect(() => {
    if (showModal) {
      reset(user);
    }
  }, [showModal, user, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showModal ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{isEditing ? "Edit User" : "Add New User"}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...register("name")}
              placeholder="Name"
              className="w-full p-2 border rounded"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              placeholder="Email"
              type="email"
              className="w-full p-2 border rounded"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select {...register("role")} defaultValue={user.role} className="w-full p-2 border rounded">
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select {...register("status")} defaultValue={user.status} className="w-full p-2 border rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
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
              {isEditing ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;