import React, { forwardRef } from "react";

interface InputBoxProps {
  type?: string;
  placeholder?: string;
  className?: string;
  onEnter?: () => void;  
}

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  ({ type = "text", placeholder = "", className = "", onEnter }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={className}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            onEnter();
          }
        }}
      />
    );
  }
);
