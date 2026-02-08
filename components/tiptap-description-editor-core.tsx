// components/tiptap-description-editor-core.tsx

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface TiptapDescriptionEditorCoreProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxCharacters?: number;
}

export function TiptapDescriptionEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  className,
  maxCharacters = 5000,
}: TiptapDescriptionEditorCoreProps) {
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["paragraph"],
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const percentage = editor 
    ? Math.round((editor.storage.characterCount.characters() / maxCharacters) * 100)
    : 0;

  const isNearLimit = percentage >= 90;
  const isAtLimit = percentage >= 100;

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    disabled, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-slate-200 text-blue-600"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-slate-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 pr-2 border-r">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-2 border-r">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 pr-2 border-r">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <p className="absolute top-2 left-3 text-slate-400 pointer-events-none">
            {placeholder}
          </p>
        )}
      </div>

      {/* Character Count Footer */}
      <div className={cn(
        "border-t px-3 py-2 text-xs flex items-center justify-between",
        isAtLimit && "bg-red-50 border-red-200",
        isNearLimit && !isAtLimit && "bg-yellow-50 border-yellow-200"
      )}>
        <div className="flex items-center gap-2">
          {isAtLimit && (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className={cn(
            "font-medium",
            isAtLimit && "text-red-700",
            isNearLimit && !isAtLimit && "text-yellow-700",
            !isNearLimit && "text-slate-600"
          )}>
            {editor.storage.characterCount.characters()} / {maxCharacters} characters
          </span>
        </div>
        
        {isAtLimit && (
          <span className="text-red-700 font-medium">
            Character limit reached
          </span>
        )}
      </div>
    </div>
  );
}