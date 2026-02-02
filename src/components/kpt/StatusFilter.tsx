import { ReactElement } from 'react';

import { Checkbox } from '@/components/shadcn/checkbox';
import { PROBLEM_STATUS_LABELS, TryStatus } from '@/types/kpt';

interface StatusFilterProps {
  selectedStatuses: TryStatus[];
  onStatusChange: (statuses: TryStatus[]) => void;
}

const ALL_STATUSES: TryStatus[] = ['pending', 'in_progress', 'done', 'wont_fix'];

export function StatusFilter({ selectedStatuses, onStatusChange }: StatusFilterProps): ReactElement {
  const toggleStatus = (status: TryStatus, checked: boolean) => {
    if (checked) {
      onStatusChange([...selectedStatuses, status]);
    } else {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4" role="group" aria-label="ステータスフィルター">
      <span className="text-muted-foreground text-sm">フィルター:</span>
      {ALL_STATUSES.map((status) => {
        const isSelected = selectedStatuses.includes(status);
        return (
          <label
            key={status}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 transition-colors ${
              isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted/50'
            }`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => toggleStatus(status, checked === true)}
              className="data-[state=unchecked]:border-muted-foreground/50 shadow-none"
            />
            <span className="text-sm font-medium select-none">{PROBLEM_STATUS_LABELS[status]}</span>
          </label>
        );
      })}
    </div>
  );
}
