import { useEffect, useState } from "react";
import { api } from "../services/api";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getActivityLogs();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <ul>
          {logs.map((log) => (
            <li key={log.id} className="mb-2">
              <span className="font-semibold">{log.user}</span> {log.action} on {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogs;