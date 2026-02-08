// components/description-editor-wrapper.tsx
"use client";

import { useState } from "react";
import { TiptapDescriptionEditor } from "./tiptap-description-editor-core";
// import { TiptapDescriptionEditor } from "./tiptap-description-editor";

interface DescriptionEditorWrapperProps {
  initialValue: string;
  fieldName: string;
  placeholder?: string;
  maxCharacters?: number;
}

export function DescriptionEditorWrapper({
  initialValue,
  fieldName,
  placeholder = "Enter description...",
  maxCharacters = 5000,
}: DescriptionEditorWrapperProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <TiptapDescriptionEditor
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        maxCharacters={maxCharacters}
      />
      {/* Hidden input to sync with form */}
      <input
        type="hidden"
        name={fieldName}
        value={value}
      />
    </>
  );
}
