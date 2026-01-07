import { User, X } from 'lucide-react';
import { ReactElement } from 'react';

interface FilterChipProps {
  icon?: ReactElement;
  label: string;
  onRemove: () => void;
}

function FilterChip({ icon, label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-sm text-primary">
      {icon}
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
        aria-label={`${label}フィルターを解除`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

interface FilterBarProps {
  filterTag: string | null;
  filterMemberName: string | null;
  onRemoveTag: () => void;
  onRemoveMember: () => void;
}

/**
 * アクティブなフィルターを表示するバー
 */
export function FilterBar({
  filterTag,
  filterMemberName,
  onRemoveTag,
  onRemoveMember,
}: FilterBarProps): ReactElement | null {
  const hasFilters = filterTag || filterMemberName;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">フィルター:</span>
      <div className="flex flex-wrap items-center gap-2">
        {filterTag && (
          <FilterChip
            label={filterTag}
            onRemove={onRemoveTag}
          />
        )}
        {filterMemberName && (
          <FilterChip
            icon={<User className="h-3 w-3" />}
            label={filterMemberName}
            onRemove={onRemoveMember}
          />
        )}
      </div>
    </div>
  );
}
