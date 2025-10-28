import { useEffect, useState } from "react";
import { getAllUsersAPI } from "@/service/operations/auth";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await getAllUsersAPI();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        All Registered Users
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 font-medium">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {user.role}
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
