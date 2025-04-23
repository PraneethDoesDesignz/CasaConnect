import * as React from "react";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
      className={
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
        (className || "")
      }
      {...props}
      ref={ref}
    />
  )
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg " +
          (className || "")
        }
        {...props}
      />
    </AlertDialogPortal>
  )
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export default function AuthErrorDialog({ open, onOpenChange, errorMessage, errorTitle }) {
  // Show green tick for success, else red exclamation
  const isSuccess = errorTitle && errorTitle.toLowerCase().includes('success');
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle2 className="text-green-500" />
          ) : (
            <AlertTriangle className="text-red-500" />
          )}
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-1">{errorTitle || "Error"}</h2>
            <p className="text-sm text-gray-700">{errorMessage}</p>
          </div>
          <button
            className="ml-4 p-2 rounded hover:bg-gray-100 focus:outline-none"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
