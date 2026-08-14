import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { PiWarningCircle, PiCheckCircle, PiX } from 'react-icons/pi';

export default function AuthErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  errorTitle,
}) {
  const isSuccess = errorTitle?.toLowerCase().includes('success');

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className='fixed inset-0 z-50 bg-[rgb(var(--shadow-tint))]/40 backdrop-blur-[2px]' />
        <AlertDialogPrimitive.Content
          className='fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2
                     -translate-y-1/2 rounded-card border bg-surface p-6
                     shadow-[0_16px_48px_rgb(var(--shadow-tint)/0.16)]'
        >
          <div className='flex gap-4'>
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${
                isSuccess
                  ? 'bg-accent-soft text-accent-ink'
                  : 'bg-danger-soft text-danger'
              }`}
            >
              {isSuccess ? (
                <PiCheckCircle className='h-5 w-5' aria-hidden='true' />
              ) : (
                <PiWarningCircle className='h-5 w-5' aria-hidden='true' />
              )}
            </span>

            <div className='flex-1 pt-0.5'>
              <AlertDialogPrimitive.Title className='font-semibold tracking-tight'>
                {errorTitle || 'Something went wrong'}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className='mt-1.5 text-sm leading-relaxed text-muted'>
                {errorMessage}
              </AlertDialogPrimitive.Description>

              <div className='mt-5 flex justify-end'>
                <AlertDialogPrimitive.Action className='btn btn-sm btn-primary'>
                  {isSuccess ? 'Done' : 'Try again'}
                </AlertDialogPrimitive.Action>
              </div>
            </div>

            <AlertDialogPrimitive.Cancel
              aria-label='Close'
              className='-mr-2 -mt-2 flex h-8 w-8 shrink-0 items-center justify-center
                         self-start rounded-control text-muted transition-colors hover:bg-sunken hover:text-ink'
            >
              <PiX className='h-4 w-4' aria-hidden='true' />
            </AlertDialogPrimitive.Cancel>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
