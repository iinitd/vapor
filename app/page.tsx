"use client"

import SnippetForm from "@/components/SnippetForm"

export default function Home() {
  return (
    <SnippetForm mode="create" className="mb-4" onSuccess={() => window.location.reload()} />
  )
}

