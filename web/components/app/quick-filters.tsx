import * as React from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { SortKey, SortDir } from "@/components/app/leads-table";

export function QuickFilters({
  sortKey,
  onSortChange,
}: {
  sortKey: SortKey;
  onSortChange: (key: SortKey, dir: SortDir) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3 rounded-t-xl">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" aria-hidden />
        <span className="text-[13px] font-medium text-foreground">Quick Filters</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={sortKey === "score" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onSortChange("score", "desc")}
          className={`h-8 text-[12px] ${sortKey === "score" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Highest Score
        </Button>
        <Button
          variant={sortKey === "confidence" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onSortChange("confidence", "desc")}
          className={`h-8 text-[12px] ${sortKey === "confidence" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Highest Confidence
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-[12px] text-muted-foreground hover:text-foreground">
          <SlidersHorizontal className="mr-1.5 size-3.5" aria-hidden />
          More Filters
        </Button>
      </div>
    </div>
  );
}
