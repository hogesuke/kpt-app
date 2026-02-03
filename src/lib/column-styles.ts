import { cva } from 'class-variance-authority';

import type { KptColumnType } from '@/types/kpt';

export const columnDot = cva('h-2 w-2 rounded-full', {
  variants: {
    column: {
      keep: '',
      problem: '',
      try: '',
    },
    selected: {
      true: '',
      false: 'bg-gray-400',
    },
  },
  compoundVariants: [
    { column: 'keep', selected: true, class: 'bg-lime-500' },
    { column: 'problem', selected: true, class: 'bg-red-400' },
    { column: 'try', selected: true, class: 'bg-blue-500' },
  ],
});

export const columnButton = cva('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors', {
  variants: {
    selected: {
      true: 'border-2 border-primary bg-primary/10 text-primary-dark',
      false:
        'border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300',
    },
    column: {
      keep: '',
      problem: '',
      try: '',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const columnLabels: Record<KptColumnType, string> = {
  keep: 'Keep',
  problem: 'Problem',
  try: 'Try',
};
