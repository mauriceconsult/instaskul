import { NoticeboardWithRelations } from "@/actions/get-noticeboards";
import { NoticeboardCard } from "@/components/noticeboard-card";


interface NoticeboardsListProps {
  items: NoticeboardWithRelations[];
}

export const NoticeboardsList = ({ items }: NoticeboardsListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((noticeboard) => (
          <NoticeboardCard
            key={noticeboard.id}
            id={noticeboard.id}
            title={noticeboard.title}
            description={noticeboard.description ?? ""}
            noticeboardId={noticeboard.id}                     
          />
        ))}
      </div>
      {items.length === 0 && <div className="text-sm text-slate-500 italic">No noticeboards found.</div>}
    </div>
  );
};
