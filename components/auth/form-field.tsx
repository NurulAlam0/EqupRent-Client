"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
};

export function FormField({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "h-9 w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15",
            trailing ? "pr-10 pl-9" : "pl-9"
          )}
        />
        {trailing ? (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {trailing}
          </div>
        ) : null}
      </div>
    </div>
  );
}
