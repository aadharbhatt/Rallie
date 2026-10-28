import type { ComponentProps, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

type DialogProps = Omit<ComponentProps<typeof DialogPrimitive.Content>, 'title'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
};

/** Shared modal surface; Radix owns focus trapping, dismissal, and background isolation. */
export function Dialog({ open, onOpenChange, title, description, children, className = '', ...props }: DialogProps) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content className={`command-dialog ${className}`} {...props}>
        <div className="dialog-heading">
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close asChild><button type="button" className="icon-button" aria-label="Close dialog"><X size={20} aria-hidden="true" /></button></DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}