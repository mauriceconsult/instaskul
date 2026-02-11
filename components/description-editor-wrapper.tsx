// components/description-editor-wrapper.tsx
"use client";

import { useEffect } from "react";
import { TiptapDescriptionEditor } from "./tiptap-description-editor-core";

interface DescriptionEditorWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  initialValue?: string;
  fieldName?: string;
  placeholder?: string;
  maxCharacters?: number;
}

export function DescriptionEditorWrapper({
  value,
  onChange,
  initialValue,
  fieldName,
  placeholder = "Enter description...",
  maxCharacters = 5000,
}: DescriptionEditorWrapperProps) {
  // Support both controlled (React Hook Form) and uncontrolled modes
  const isControlled = value !== undefined && onChange !== undefined;
  
  if (isControlled) {
    // Controlled mode - for use with React Hook Form
    return (
      <TiptapDescriptionEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxCharacters={maxCharacters}
      />
    );
  }

  // Uncontrolled mode - for regular forms with hidden input
  return (
    <>
      <TiptapDescriptionEditor
        value={initialValue || ""}
        onChange={(newValue) => {
          // Update hidden input
          const hiddenInput = document.querySelector(
            `input[name="${fieldName}"]`
          ) as HTMLInputElement;
          if (hiddenInput) {
            hiddenInput.value = newValue;
          }
        }}
        placeholder={placeholder}
        maxCharacters={maxCharacters}
      />
      {/* Hidden input to sync with form */}
      <input
        type="hidden"
        name={fieldName}
        defaultValue={initialValue || ""}
      />
    </>
  );
}
