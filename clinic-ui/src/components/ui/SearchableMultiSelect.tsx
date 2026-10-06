import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
  secondaryLabel?: string;
}

interface SearchableMultiSelectProps {
  value: string[];
  options: SearchableMultiSelectOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  noResultsText?: string;
  maxResults?: number;
}

export function SearchableMultiSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  noResultsText = "No results found.",
  maxResults = 8,
}: SearchableMultiSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUpward, setOpenUpward] = useState(false);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = searchValue
      ? options.filter((option) => {
          const label = option.label.toLowerCase();
          const secondary = option.secondaryLabel?.toLowerCase() ?? "";

          return label.includes(searchValue) || secondary.includes(searchValue);
        })
      : options;

    return filtered.slice(0, maxResults);
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

  const toggleOption = (option: SearchableMultiSelectOption) => {
    if (value.includes(option.value)) {
      onChange(value.filter((id) => id !== option.value));
    } else {
      onChange([...value, option.value]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter((id) => id !== optionValue));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`
            flex
            h-10
            w-full
            items-center
            rounded-xl
            bg-slate-50
            px-3
            text-sm
            leading-5
            text-slate-700
            ring-1
            ring-slate-200/70
            transition
            ${disabled ? "cursor-not-allowed opacity-60" : "cursor-text"}
            ${open ? "bg-white ring-2 ring-teal-500/20" : ""}
        `}
        onClick={openDropdown}
      >
        <div className="flex h-full w-full items-center gap-2 leading-5">
          {selectedOptions.length > 0 ? (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                {selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1
                      rounded-lg
                      bg-teal-50
                      px-2
                      py-1
                      text-sm
                      font-medium
                      text-teal-700
                    "
                  >
                    <span className="max-w-[180px] truncate">
                      {option.label}
                    </span>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeOption(option.value);
                      }}
                      className="shrink-0 rounded-full text-teal-500 hover:text-teal-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <Search size={14} className="ml-auto shrink-0 text-slate-300" />
            </>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <Search size={15} className="shrink-0 text-slate-300" />

              <span className="text-[14px] leading-5 text-slate-400">
                {placeholder}
              </span>
            </div>
          )}
        </div>
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
          <div className="sticky top-0 z-10 bg-white px-2 py-2">
            <div className="relative">
              <Search
                size={14}
                className="
                  absolute
                  left-2.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-300
                "
              />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="
                  h-9
                  w-full
                  rounded-lg
                  border-0
                  bg-slate-50
                  pl-8
                  pr-3
                  text-xs
                  text-slate-700
                  outline-none
                  ring-1
                  ring-slate-200/70
                  placeholder:text-slate-300
                  focus:bg-white
                  focus:ring-2
                  focus:ring-teal-500/20
                "
              />
            </div>
          </div>

          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-400">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">
              {noResultsText}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const selected = value.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option)}
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
                    <p className="truncate text-sm font-medium text-slate-700">
                      {option.label}
                    </p>

                    {option.secondaryLabel && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {option.secondaryLabel}
                      </p>
                    )}
                  </div>

                  {selected && (
                    <Check size={15} className="shrink-0 text-teal-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
