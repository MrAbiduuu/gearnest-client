"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type EquipmentSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

const EquipmentSearch = ({
  value,
  onChange,
  onSearch,
}: EquipmentSearchProps) => {
  return (
    <form
      className="flex w-full flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by equipment name, category or brand..."
          aria-label="Search equipment"
          className="h-11 w-full rounded-md border border-[#e7ddcf] bg-background pr-3 pl-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#8b6b4a] focus:ring-2 focus:ring-[#8b6b4a]/15 dark:border-green-900/70"
        />
      </div>

      <Button
        type="submit"
        className="h-11 shrink-0 rounded-md bg-[#4a3020] px-6 font-semibold text-white hover:bg-[#3a2417] dark:bg-[#7a5335] dark:hover:bg-[#8d6240]"
      >
        Search
      </Button>
    </form>
  );
};

export default EquipmentSearch;
