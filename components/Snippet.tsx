"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { deleteSnippet } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SnippetForm from "./SnippetForm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updateSnippet } from "@/lib/db";

type SnippetProps = {
  snippet: {
    id: string;
    content: string;
  };
  onRefetchList?: () => void;
  dragHandleProps?: any;
  enableDrag?: boolean;
};

export default function Snippet({
  snippet,
  onRefetchList,
  enableDrag = false,
}: SnippetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: snippet.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="relative flex group border-0 shadow-none hover:border hover:border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => !isEditing && setIsEditing(true)}
    >
      {enableDrag && (
        <div
          {...attributes}
          {...listeners}
          className="flex items-center px-2 cursor-move hover:text-primary transition-opacity transition-colors opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1">
        <CardContent className="pt-6">
          {isEditing ? (
            <SnippetForm
              mode="edit"
              initialData={snippet}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => {
                setIsEditing(false);
                onRefetchList?.();
              }}
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  input: ({ checked, type }) => {
                    if (type === 'checkbox') {
                      return (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={async () => {
                            const newContent = snippet.content.replace(
                              checked ? '[x]' : '[ ]',
                              checked ? '[ ]' : '[x]'
                            );
                            await updateSnippet(snippet.id, { content: newContent });
                            onRefetchList?.();
                          }}
                        />
                      );
                    }
                    return null;
                  }
                }}
              >
                {snippet.content}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
        {isHovered && !isEditing && (
          <CardFooter className="absolute top-2 right-2 p-0 border-none bg-transparent">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={async () => {
                try {
                  await deleteSnippet(snippet.id);
                  onRefetchList?.();
                } catch (error) {
                  console.error("Error deleting snippet:", error);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
