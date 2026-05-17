import { COLOR_LEGEND_ITEMS } from "../noteColors";

interface PdfColorLegendProps {
  variant?: "default" | "meeting";
}

export default function PdfColorLegend({
  variant = "default",
}: PdfColorLegendProps) {
  const isMeeting = variant === "meeting";

  return (
    <div
      className={`pdf-color-legend ${
        isMeeting ? "px-2 py-5" : "px-6 py-5"
      }`}
    >
      <p
        className={`font-bold text-slate-800 ${
          isMeeting ? "mb-4 text-center text-xl" : "mb-4 text-base"
        }`}
      >
        Colour legend
      </p>
      <div
        className={`flex flex-wrap gap-8 ${
          isMeeting ? "justify-center text-xl" : "justify-start text-base"
        }`}
      >
        {COLOR_LEGEND_ITEMS.map((item) => (
          <div key={item.color} className="flex items-center gap-3">
            <span
              className={`shrink-0 rounded border-2 ${item.swatch} ${
                isMeeting ? "h-6 w-10" : "h-5 w-9"
              }`}
              aria-hidden
            />
            <span className="font-semibold text-slate-800">
              <span className="capitalize">{item.color}</span>
              <span className="font-medium text-slate-600">
                {" "}
                = {item.meaning}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
