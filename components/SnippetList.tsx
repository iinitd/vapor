import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Snippet from "./Snippet";
import { useSnippets, useSnippetsByNotepad } from "@/hooks/use-db";
import { useState } from "react";

type SnippetListProps = {
  type: "all" | "notepad";
  notepadId?: string;
  title?: string;
  onRefetchList?: () => void;
};

type Snippet = {
  id: string;
  title: string;
  content: string;
  notepadId?: string;
  createdAt: number;
  updatedAt: number;
};

export default function SnippetList({ type, notepadId, title = "Snippets", onRefetchList }: SnippetListProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { data: allSnippets, isLoading: isLoadingAll, refetch: refetchSnippets } = useSnippets();
  const { data: notepadSnippets, isLoading: isLoadingNotepad } = useSnippetsByNotepad(notepadId);
  
  const snippets = type === "notepad" && notepadId
    ? notepadSnippets || []
    : (allSnippets || []).filter(snippet => !snippet.notepadId);
  
  const loading = type === "notepad" ? isLoadingNotepad : isLoadingAll;

  if (loading) {
    return <div className="p-4">Loading snippets...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {type === "all" ? "All Snippets" : `Notepad ${notepadId}`}
        </h2>
      </div>
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          {snippets.length === 0 ? (
            <p className="text-muted-foreground">No snippets found.</p>
          ) : (
            snippets.map((snippet) => (
              <div key={snippet.id}>
                <Snippet snippet={snippet} onRefetchList={refetchSnippets} enableDrag={type === "notepad"} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
