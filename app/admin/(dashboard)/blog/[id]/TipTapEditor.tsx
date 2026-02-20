"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

export default function TipTapEditor({ content, onUpdate }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "", // Başlangıçta boş
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
  });

  // content prop’u değişirse editör güncellensin
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return <EditorContent editor={editor} className="border p-2 h-64 overflow-y-auto" />;
}
