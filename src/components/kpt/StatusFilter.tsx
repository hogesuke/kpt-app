import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/components/shadcn/checkbox';
import { cn } from '@/lib/cn';
import { getStatusLabels } from '@/lib/kpt-helpers';
import { TryStatus } from '@/types/kpt';

interface StatusFilterProps {
  selectedStatuses: TryStatus[];
  onStatusChange: (statuses: TryStatus[]) => void;
}

const ALL_STATUSES: TryStatus[] = ['pending', 'in_progress', 'done', 'wont_fix'];

const statusSelectedStyles: Record<TryStatus, string> = {
  pending: 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-400/60 dark:bg-amber-900/30 dark:text-amber-300',
  in_progress: 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-400/60 dark:bg-sky-900/30 dark:text-sky-300',
  done: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/60 dark:bg-emerald-900/30 dark:text-emerald-300',
  wont_fix: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-400/60 dark:bg-slate-700/30 dark:text-slate-300',
};

export function StatusFilter({ selectedStatuses, onStatusChange }: StatusFilterProps): ReactElement {
  const { t } = useTranslation('board');

  const toggleStatus = (status: TryStatus, checked: boolean) => {
    if (checked) {
      onStatusChange([...selectedStatuses, status]);
    } else {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('ステータスフィルター')}>
      <span className="text-muted-foreground text-sm">{t('フィルター')}:</span>
      {ALL_STATUSES.map((status) => {
        const isSelected = selectedStatuses.includes(status);
        return (
          <label
            key={status}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
              isSelected ? statusSelectedStyles[status] : 'border-border bg-background hover:bg-muted/50'
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => toggleStatus(status, checked === true)}
              className="data-[state=unchecked]:border-muted-foreground/50 data-[state=checked]:text-foreground dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground dark:data-[state=checked]:border-primary h-4 w-4 rounded-full shadow-none data-[state=checked]:border-transparent data-[state=checked]:bg-white"
            />
            <span className="select-none">{getStatusLabels()[status]}</span>
          </label>
        );
      })}
    </div>
  );
}
