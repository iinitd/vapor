"use client";

import { useParams } from "next/navigation";
import NotepadDetail from "@/components/NotepadDetail";
import SnippetForm from "@/components/SnippetForm";

export default function NotepadPage() {
  const params = useParams();
  const notepadId = params.id as string;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <NotepadDetail notepadId={notepadId} />
    </div>
  );
}
