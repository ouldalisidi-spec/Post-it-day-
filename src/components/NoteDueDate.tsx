import { formatDueDate, isDueDateOverdue } from "../dueDate";

interface NoteDueDateProps {
  dueDate: string;
  className?: string;
  size?: "sm" | "md";
}

export default function NoteDueDate({
  dueDate,
  className = "",
  size = "sm",
}: NoteDueDateProps) {
  const overdue = isDueDateOverdue(dueDate);
  const sizeClass = size === "md" ? "text-base" : "text-xs";

  return (
    <p
      className={`font-semibold ${sizeClass} ${
        overdue ? "text-red-700" : "text-slate-600"
      } ${className}`.trim()}
    >
      Due {formatDueDate(dueDate)}
      {overdue ? " (overdue)" : ""}
    </p>
  );
}
