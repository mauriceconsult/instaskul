import { AdminsWithSchool } from "@/actions/get-admins";
import { AdminCard } from "@/components/admin-card";


interface AdminsListProps {
  items: AdminsWithSchool[];
}

export const AdminsList = ({ items }: AdminsListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <AdminCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl ?? "/placeholder.jpg"}
            description={item.description ?? ""}
            school={item.school?.name ?? ""}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-sm text-slate-500 italic">No admins found.</div>
      )}
    </div>
  );
};
