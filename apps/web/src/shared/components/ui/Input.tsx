import * as React from "react";

import { cn } from "@/shared/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const inputElement = (
      <input
        type={type}
        id={inputId}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="grid w-full items-center gap-1.5">
          <label
            htmlFor={inputId}
            className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1"
          >
            {label}
          </label>
          {inputElement}
        </div>
      );
    }

    return inputElement;
  },
);
Input.displayName = "Input";

export { Input };
