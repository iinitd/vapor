"use client";

import { useState, useEffect, useRef } from "react";
import { addNotepad, getAllNotepads, deleteNotepad } from "@/lib/db";
import { useUpdateNotepad } from "@/hooks/use-db";
import {
  Home,
  MoreHorizontal,
  Plus,
  StarOff,
  Trash2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DatePicker } from "./DatePicker";

interface Notepad {
  id: string;
  name: string;
  folderId: string;
}

interface EditingState {
  id: string;
  name: string;
}

interface LeftNavProps {
  onSelect: (selection: { type: "all" | "notepad"; id: string | null }) => void;
}

export default function LeftNav({ onSelect }: LeftNavProps) {
  const [notepads, setNotepads] = useState<Notepad[]>([]);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const scrollToActiveItem = () => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  useEffect(() => {
    const loadNotepads = async () => {
      const pads = await getAllNotepads();
      setNotepads(pads);
      requestAnimationFrame(scrollToActiveItem);
    };
    loadNotepads();
  }, []);

  useEffect(() => {
    requestAnimationFrame(scrollToActiveItem);
  }, [pathname]);

  const handleCreateNotepad = async () => {
    const newNotepad = await addNotepad({
      name: 'Untitled',
      folderId: "default",
    });
    setNotepads([...notepads, newNotepad]);
    router.push(`/notepad/${newNotepad.id}`);
  };

  const handleDeleteNotepad = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotepad(id);
    setNotepads(notepads.filter((notepad) => notepad.id !== id));
    if (pathname === `/notepad/${id}`) {
      router.push("/all");
    }
  };

  const handleStartEditing = (notepad: Notepad, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing({ id: notepad.id, name: notepad.name });
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const { mutateAsync: updateNotepad } = useUpdateNotepad();

  const handleSaveEditing = async (
    e: React.KeyboardEvent | React.FocusEvent
  ) => {
    if (e.type === "keydown") {
      const keyEvent = e as React.KeyboardEvent;
      if (keyEvent.key !== "Enter") {
        return;
      }
    }
    if (!editing) return;

    try {
      const updatedNotepad = await updateNotepad({
        id: editing.id,
        notepad: { name: editing.name },
      });
      setNotepads(
        notepads.map((n) => (n.id === editing.id ? updatedNotepad : n))
      );
      setEditing(null);
    } catch (error) {
      console.error("Failed to update notepad name:", error);
    }
  };

  const isActive = (path: string) => pathname === path;
  const isNotepadActive = (id: string) => pathname === `/notepad/${id}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem key="all">
            <SidebarMenuButton asChild>
              <a
                ref={isActive("/all") ? activeItemRef : null}
                onClick={() => onSelect({ type: "all", id: null })}
                className={`hover:cursor-pointer ${
                  isActive("/all") ? "bg-accent" : ""
                }`}
              >
                <Home />
                <span>Home</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <DatePicker />
        <SidebarSeparator className="mx-0" /> */}
        <SidebarGroup>
          <SidebarGroupLabel>Notepads</SidebarGroupLabel>
          <SidebarMenu>
            {notepads.map((notepad) => (
              <SidebarMenuItem key={notepad.id}>
                <SidebarMenuButton asChild>
                  <a
                    ref={isNotepadActive(notepad.id) ? activeItemRef : null}
                    className={`hover:cursor-pointer group relative ${
                      isNotepadActive(notepad.id) ? "bg-accent" : ""
                    }`}
                    onClick={() =>
                      onSelect({ type: "notepad", id: notepad.id })
                    }
                    onDoubleClick={(e) => handleStartEditing(notepad, e)}
                  >
                    {editing?.id === notepad.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                        onKeyDown={handleSaveEditing}
                        onBlur={handleSaveEditing}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent outline-none"
                      />
                    ) : (
                      <span>{notepad.name}</span>
                    )}
                  </a>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-lg">
                    <DropdownMenuItem>
                      <StarOff className="text-muted-foreground" />
                      <span>Remove from Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDeleteNotepad(notepad.id, e)}
                    >
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleCreateNotepad}>
                <Plus />
                <span>New notepad</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
