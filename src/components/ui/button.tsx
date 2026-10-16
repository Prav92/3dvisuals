import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-md text-xs transition-colors focus-visible:outline-2 focus-visible:outline-emerald-300 disabled:opacity-50', { variants: { variant: { default: 'bg-slate-700 hover:bg-slate-600 text-white', ghost: 'hover:bg-slate-700/60 text-slate-300' }, size: { default: 'h-8 px-3', icon: 'h-8 w-8' } }, defaultVariants: { variant: 'default', size: 'default' } });
export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) { const Comp = asChild ? Slot : 'button'; return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />; }
