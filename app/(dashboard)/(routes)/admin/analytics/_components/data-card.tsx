import { formatAmount } from "@/lib/format";

type DataCardProps = {
  label: string;
  value: number;
  shouldFormat: boolean;
};

export const DataCard = ({ label, value, shouldFormat }: DataCardProps) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h3 className="text-lg font-semibold">{label}</h3>
      <p className="text-2xl">{shouldFormat ? formatAmount(value) : value}</p>
    </div>
  );
};
