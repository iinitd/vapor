"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAddSnippet, useUpdateSnippet } from "@/hooks/use-db";
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface SnippetFormProps {
  mode: "create" | "edit";
  notepadId?: string;
  className?: string;
  initialData?: {
    id: string;
    content: string;
  };
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function SnippetForm({
  mode,
  notepadId,
  className = "",
  initialData,
  onCancel,
  onSuccess,
}: SnippetFormProps) {
  const [content, setContent] = useState(initialData?.content || "");

  const addSnippetMutation = useAddSnippet();
  const updateSnippetMutation = useUpdateSnippet();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      if (mode === "create") {
        await addSnippetMutation.mutateAsync({
          content: content.trim(),
          notepadId,
        });
        setContent("");
      } else if (mode === "edit" && initialData) {
        await updateSnippetMutation.mutateAsync({
          id: initialData.id,
          snippet: {
            content: content.trim(),
          }
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving snippet:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          preview='live'
          height={300}
          className="w-full"
        />
        <div className="absolute bottom-2 right-2 flex gap-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-lg">
          {mode === "edit" && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "添加" : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}