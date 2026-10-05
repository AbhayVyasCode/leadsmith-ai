"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import s from "./overlays.module.css";

/* ---------------------------------------------------------------- sheet */

export const Sheet = Dialog.Root;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

/** Right-hand side sheet (bottom sheet on small screens). */
export function SheetContent({ className, children, ...props }: ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={s.overlay} />
      <Dialog.Content className={cn(s.sheet, className)} {...props}>
        {children}
        <Dialog.Close className={s.close} aria-label="Close">
          <X className="size-[18px]" aria-hidden />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/* --------------------------------------------------------------- confirm */

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />
        <Dialog.Content className={s.dialog}>
          <Dialog.Title className="font-display text-[1.9rem] leading-tight text-ink">{title}</Dialog.Title>
          <Dialog.Description className="mt-3 text-[0.97rem] leading-relaxed text-ink-2">{body}</Dialog.Description>
          <div className="mt-7 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              className="bg-bad text-canvas shadow-none hover:bg-[color-mix(in_oklab,var(--bad)_88%,black)]"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* --------------------------------------------------------------- popover */

export const PopoverRoot = Popover.Root;
export const PopoverTrigger = Popover.Trigger;

export function PopoverContent({ className, align = "start", sideOffset = 10, ...props }: ComponentProps<typeof Popover.Content>) {
  return (
    <Popover.Portal>
      <Popover.Content align={align} sideOffset={sideOffset} collisionPadding={16} className={cn(s.popover, className)} {...props} />
    </Popover.Portal>
  );
}
