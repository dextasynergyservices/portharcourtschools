"use client";

import ImageExtension from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] max-w-none p-4 focus:outline-hidden font-sans text-sm text-[#151B2E] leading-relaxed prose prose-headings:font-heading prose-h2:text-xl prose-h2:font-bold prose-h2:text-[#184098] prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:font-bold prose-h3:text-[#151B2E] prose-h3:mt-4 prose-h3:mb-2 prose-p:my-2 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5 prose-blockquote:border-l-4 prose-blockquote:border-[#FDDA32] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:text-muted-foreground prose-img:rounded-[2px] prose-img:my-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external content changes if editor content is empty or changed outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-[360px] w-full rounded-[2px] border border-[#D9DEEC] bg-[#FAFBFF] flex items-center justify-center text-xs text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="rounded-[2px] border border-[#D9DEEC] bg-white overflow-hidden shadow-xs focus-within:border-[#184098] transition-colors">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#D9DEEC] bg-[#FAFBFF] p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`size-8 p-0 ${
            editor.isActive("bold")
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Bold"
        >
          <Bold className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`size-8 p-0 ${
            editor.isActive("italic")
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Italic"
        >
          <Italic className="size-4" />
        </Button>

        <div className="h-4 w-px bg-[#D9DEEC] mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`size-8 p-0 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`size-8 p-0 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </Button>

        <div className="h-4 w-px bg-[#D9DEEC] mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`size-8 p-0 ${
            editor.isActive("bulletList")
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Bullet List"
        >
          <List className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`size-8 p-0 ${
            editor.isActive("orderedList")
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`size-8 p-0 ${
            editor.isActive("blockquote")
              ? "bg-[#184098] text-white hover:bg-[#08276B]"
              : "text-[#151B2E] hover:bg-[#EEF2FA]"
          }`}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="size-8 p-0 text-[#151B2E] hover:bg-[#EEF2FA]"
          title="Divider Line"
        >
          <Minus className="size-4" />
        </Button>

        <div className="h-4 w-px bg-[#D9DEEC] mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="size-8 p-0 text-[#151B2E] hover:bg-[#EEF2FA]"
          title="Insert Image"
        >
          <ImageIcon className="size-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="size-8 p-0 text-[#151B2E] hover:bg-[#EEF2FA] disabled:opacity-30"
            title="Undo"
          >
            <Undo className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="size-8 p-0 text-[#151B2E] hover:bg-[#EEF2FA] disabled:opacity-30"
            title="Redo"
          >
            <Redo className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
