const ConfirmationDialog = ({ show, title, message, onConfirm, onCancel }) => {
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel}></div>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <div className="p-4">
            <p>{message}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmationDialog;