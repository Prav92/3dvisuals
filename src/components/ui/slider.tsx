'use client';
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) { return <SliderPrimitive.Root className={cn('relative flex w-full touch-none select-none items-center py-3', className)} {...props}><SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-slate-700"><SliderPrimitive.Range className="absolute h-full bg-emerald-300" /></SliderPrimitive.Track><SliderPrimitive.Thumb aria-label="Fulfillment efficiency" className="block h-3 w-3 rounded-full border border-emerald-200 bg-emerald-300 shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300" /></SliderPrimitive.Root>; }
