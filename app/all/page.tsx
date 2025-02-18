"use client";

import SnippetForm from "@/components/SnippetForm";
import SnippetList from "@/components/SnippetList";

export default function AllPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SnippetForm mode="create" />
      <SnippetList type="all"/>
    </div>
  );
}