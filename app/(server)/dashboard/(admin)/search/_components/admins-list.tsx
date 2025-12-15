import { AdminCard } from "@/components/admin-card";
import { AdminsWithSchool } from "@/actions/get-admins";

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
            imageUrl={item.imageUrl || "/Jslogo.png"}
            school={item.school?.name || "No School"}
            description={item.description || ""}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No admins found
        </div>
      )}
    </div>
  );
};