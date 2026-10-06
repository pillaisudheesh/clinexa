import { Search, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  secondaryLabel?: string;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  noResultsText?: string;
  maxResults?: number;
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  noResultsText = "No results found.",
  maxResults = 8,
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUpward, setOpenUpward] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return options.slice(0, maxResults);
    }

    return options
      .filter((option) => {
        const label = option.label.toLowerCase();
        const secondary = option.secondaryLabel?.toLowerCase() ?? "";

        return label.includes(searchValue) || secondary.includes(searchValue);
      })
      .slice(0, maxResults);
  }, [options, search, maxResults]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const updateDropdownPosition = () => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    const availableBelow = window.innerHeight - rect.bottom;
    const availableAbove = rect.top;

    const dropdownHeight = 260;

    setOpenUpward(
      availableBelow < dropdownHeight && availableAbove > availableBelow,
    );
  };

  const openDropdown = () => {
    if (disabled) {
      return;
    }

    updateDropdownPosition();
    setOpen(true);
  };

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.value);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={15}
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-slate-300
          "
        />

        <input
          value={selectedOption ? search || selectedOption.label : search}
          onChange={(event) => {
            const inputValue = event.target.value;

            setSearch(inputValue);

            if (selectedOption && inputValue !== selectedOption.label) {
              onChange("");
            }

            openDropdown();
          }}
          onFocus={openDropdown}
          placeholder={placeholder}
          disabled={disabled}
          className="
            h-10
            w-full
            rounded-xl
            border-0
            bg-slate-50
            pl-9
            pr-3
            text-sm
            text-slate-700
            outline-none
            ring-1
            ring-slate-200/70
            placeholder:text-slate-300
            focus:bg-white
            focus:ring-2
            focus:ring-teal-500/20
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />
      </div>

      {open && !disabled && (
        <div
          className={`
            absolute
            left-0
            right-0
            z-30
            max-h-64
            overflow-y-auto
            rounded-xl
            bg-white
            shadow-[0_15px_40px_rgba(15,23,42,0.12)]
            ring-1
            ring-slate-200/70
            ${openUpward ? "bottom-[46px]" : "top-[46px]"}
          `}
        >
          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-400">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">
              {noResultsText}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-3
                  px-3
                  py-2.5
                  text-left
                  transition-colors
                  hover:bg-slate-50
                "
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {option.label}
                  </p>

                  {option.secondaryLabel && (
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {option.secondaryLabel}
                    </p>
                  )}
                </div>

                {option.value === value && (
                  <Check size={15} className="shrink-0 text-teal-600" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
