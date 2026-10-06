import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CustomSelectProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  displayOptions?: Record<string, string>;
  compact?: boolean;
}

export function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  displayOptions,
  compact = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", closeOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [open]);

  const selectedLabel = (displayOptions?.[value] ?? value) || placeholder;

  return (
    <div ref={containerRef} className={`relative ${compact ? "sm:w-48" : ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`
          flex
          h-10
          w-full
          items-center
          justify-between
          rounded-xl
          bg-slate-50
          px-3
          text-left
          text-sm
          outline-none
          ring-1
          ring-slate-200/70
          transition
          ${open ? "bg-white ring-2 ring-teal-500/20" : "hover:bg-slate-100"}
          ${value ? "text-slate-700" : "text-slate-300"}
          disabled:cursor-not-allowed
          disabled:opacity-60
        `}
      >
        <span className="truncate">{selectedLabel}</span>

        <ChevronDown
          size={15}
          className={`
            ml-2
            shrink-0
            text-slate-400
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && !disabled && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50
            mt-2
            overflow-hidden
            rounded-xl
            bg-white
            p-1.5
            shadow-[0_12px_30px_rgba(15,23,42,0.10)]
            ring-1
            ring-slate-200/70
          "
        >
          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  transition
                  ${
                    value === option
                      ? "bg-teal-50 font-medium text-teal-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <span>{displayOptions?.[option] ?? option}</span>

                {value === option && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
