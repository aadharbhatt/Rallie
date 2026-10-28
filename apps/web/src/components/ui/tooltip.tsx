import type { ComponentProps, ReactElement, ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ children, label, side = 'bottom' }: {
  children: ReactElement;
  label: ReactNode;
  side?: ComponentProps<typeof TooltipPrimitive.Content>['side'];
}) {
  return <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content className="ui-tooltip" side={side} sideOffset={8} collisionPadding={12}>
        {label}
        <TooltipPrimitive.Arrow className="ui-tooltip-arrow" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>;
}