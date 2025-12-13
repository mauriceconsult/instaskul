type Admin = {
  id: string;
  title: string;
  // Add other fields based on your admin schema (e.g., userId, createdAt)
};

interface AdminsListProps {
  items: Admin[];
}

const AdminsList = ({ items }: AdminsListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Admins</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No admins found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((admin) => (
            <li key={admin.id} className="p-4 border rounded-md">
              <h3 className="text-lg font-medium">{admin.title}</h3>
              {/* Add other admin fields as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminsList;
