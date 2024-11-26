import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const Dashboard = () => {
  const [state, setState] = useState({
    users: [],
    roles: [],
    usersPerRole: [],
    loading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setState((prevState) => ({ ...prevState, loading: true }));
        const [usersData, rolesData] = await Promise.all([
          api.getUsers(),
          api.getRoles(),
        ]);

        const userRoleCounts = rolesData.map((role) => ({
          name: role.name,
          userCount: usersData.filter((user) => user.role === role.name).length,
        }));

        setState({
          users: usersData,
          roles: rolesData,
          usersPerRole: userRoleCounts,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const { users, roles, usersPerRole, loading } = state;

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: "👥",
      color: "bg-blue-500",
      path: "/users",
    },
    {
      label: "Total Roles",
      value: roles.length,
      icon: "🔑",
      color: "bg-green-500",
      path: "/roles",
    },
    {
      label: "Total Permissions",
      value: roles.reduce(
        (acc, role) => acc + (role.permissions?.length || 0),
        0,
      ),
      icon: "🛡️",
      color: "bg-red-500",
      path: "/roles",
    },
  ];

  const barData = {
    labels: usersPerRole.map((role) => role.name),
    datasets: [
      {
        label: 'Users per Role',
        data: usersPerRole.map((role) => role.userCount),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: users.map((user) => new Date(user.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'User Registrations Over Time',
        data: users.map((user, index) => index + 1),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-lg cursor-pointer ${stat.color} text-white`}
            onClick={() => navigate(stat.path)}
          >
            <div className="flex items-center justify-center mb-4 text-4xl">
              {stat.icon}
            </div>
            <div className="text-5xl font-bold mb-2">{stat.value}</div>
            <div className="text-lg">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Users per Role</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">User Registrations Over Time</h2>
          <Line data={lineData} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        <ul>
          {users.slice(0, 5).map((user) => (
            <li key={user._id} className="mb-2">
              <span className="font-semibold">{user.name}</span> registered on {new Date(user.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;