import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const boardColumnVariants = cva(['bg-white', 'rounded-md', 'focus-visible:ring-1 focus-visible:ring-ring'], {
  variants: {
    type: {},
  },
  defaultVariants: {},
});

export interface KPTCardProps extends React.HTMLAttributes<HTMLLIElement>, VariantProps<typeof boardColumnVariants> {
  text: string;
}

export function KPTCard({ className, type, ...props }: KPTCardProps) {
  return (
    <li className={cn(boardColumnVariants({ type, className }))} {...props}>
      <p className="text-md p-4">{props.text}</p>
    </li>
  );
}
