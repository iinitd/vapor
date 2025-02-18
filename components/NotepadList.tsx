"use client"

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { getNotepadsByFolder } from "@/lib/db";

type NotepadListProps = {
  folderId: string;
};

type Notepad = {
  id: string;
  name: string;
  folderId: string;
  createdAt: number;
  updatedAt: number;
};

export default function NotepadList({ folderId }: NotepadListProps) {
  const [notepads, setNotepads] = useState<Notepad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotepads() {
      try {
        const data = await getNotepadsByFolder(folderId);
        setNotepads(data);
      } catch (error) {
        console.error('Failed to load notepads:', error);
      } finally {
        setLoading(false);
      }
    }

    loadNotepads();
  }, [folderId]);

  if (loading) {
    return <div className="p-4">Loading notepads...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notepads in Folder {folderId}</h2>
        <Button variant="outline" size="sm" className="flex items-center">
          <Plus size={16} className="mr-2" />
          Add Notepad
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notepads.length === 0 ? (
          <p className="text-muted-foreground">No notepads found.</p>
        ) : (
          notepads.map((notepad) => (
            <div key={notepad.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{notepad.name}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

