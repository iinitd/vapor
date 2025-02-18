"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Snippet from "./Snippet";
import {
  useNotepad,
  useSnippetsByNotepad,
  useUpdateSnippet,
  useSnippetOrderByNotepad,
  useUpdateSnippetOrder,
  useAddSnippetOrder,
} from "@/hooks/use-db";
import React from "react";
import SnippetForm from "./SnippetForm";

type NotepadDetailProps = {
  notepadId: string;
};

export default function NotepadDetail({ notepadId }: NotepadDetailProps) {
  const [snippets, setSnippets] = useState<any[]>([]);
  const { data: notepad, isLoading: isLoadingNotepad } = useNotepad(notepadId);
  const {
    data: snippetsData,
    isLoading: isLoadingSnippets,
    refetch: refetchSnippetsByNotepad,
  } = useSnippetsByNotepad(notepadId);
  const { data: snippetOrder } = useSnippetOrderByNotepad(notepadId);
  const { mutateAsync: updateSnippetOrder } = useUpdateSnippetOrder();
  const { mutateAsync: addSnippetOrder } = useAddSnippetOrder();
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loading = isLoadingNotepad || isLoadingSnippets;

  useEffect(() => {
    if (!loading && notepad && snippetsData) {
      if (snippetOrder) {
        // 将 snippets 分为有序和无序两部分
        const orderedSnippets = snippetOrder.snippetIds
          .map((id) => snippetsData.find((s) => s.id === id))
          .filter((s) => s);
        // 获取未在排序列表中的 snippets，并按创建时间降序排序
        const unorderedSnippets = snippetsData
          .filter((s) => !snippetOrder.snippetIds.includes(s.id))
          .sort((a, b) => b.createdAt - a.createdAt);
        setSnippets([...unorderedSnippets, ...orderedSnippets]);
      } else {
        // 如果不存在排序信息，按创建时间降序排序
        const validSnippets = snippetsData
          .filter((snippet) => snippet && snippet.id)
          .sort((a, b) => b.createdAt - a.createdAt);
        setSnippets(validSnippets);
        if (validSnippets.length > 0) {
          addSnippetOrder({
            notepadId,
            snippetIds: validSnippets.map((s) => s.id),
          });
        }
      }
    }
  }, [
    loading,
    notepad,
    snippetsData,
    snippetOrder,
    notepadId,
    addSnippetOrder,
  ]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !snippets.length || isUpdating) {
      return;
    }

    const oldIndex = snippets.findIndex((item) => item.id === active.id);
    const newIndex = snippets.findIndex((item) => item.id === over.id);

    if (oldIndex === newIndex) {
      return;
    }

    setIsUpdating(true);
    const newItems = arrayMove(snippets, oldIndex, newIndex);

    // 立即更新本地状态，提供即时反馈
    setSnippets(newItems);

    try {
      // 更新排序信息
      if (snippetOrder) {
        await updateSnippetOrder({
          id: snippetOrder.id,
          snippetIds: newItems.map((item) => item.id),
        });
      } else {
        await addSnippetOrder({
          notepadId,
          snippetIds: newItems.map((item) => item.id),
        });
      }
    } catch (error) {
      console.error("Failed to update snippet order:", error);
      // 发生错误时回滚到之前的状态
      setSnippets(snippets);
      await refetchSnippetsByNotepad();
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !notepad) {
    return <div className="p-4">Loading snippets...</div>;
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{notepad.name}</h2>
      </div>
      <SnippetForm notepadId={notepadId} className="mb-4" mode="create" />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={snippets.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="border border-gray-200 rounded-lg p-4">
            {snippets.map((snippet) => (
              <Snippet
                key={snippet.id}
                snippet={snippet}
                onRefetchList={refetchSnippetsByNotepad}
                enableDrag
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
