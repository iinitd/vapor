import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '../lib/db';

// Snippets hooks
export function useSnippets() {
  return useQuery({
    queryKey: ['snippets'],
    queryFn: () => db.getAllSnippets()
  });
}

export function useSnippetsByNotepad(notepadId: string | undefined) {
  const query = useQuery({
    queryKey: ['snippets', 'by-notepad', notepadId],
    queryFn: () => notepadId ? db.getSnippetsByNotepad(notepadId) : Promise.resolve([]),
    enabled: !!notepadId
  });

  return {
    ...query,
    refresh: query.refetch
  };
}

export function useSnippet(id: string | undefined) {
  return useQuery({
    queryKey: ['snippets', id],
    queryFn: () => id ? db.getSnippet(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useAddSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (snippet: Parameters<typeof db.addSnippet>[0]) => db.addSnippet(snippet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
    }
  });
}

export function useUpdateSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, snippet }: { id: string; snippet: Parameters<typeof db.updateSnippet>[1] }) =>
      db.updateSnippet(id, snippet),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      queryClient.invalidateQueries({ queryKey: ['snippets', id] });
    }
  });
}

export function useDeleteSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteSnippet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
    }
  });
}

// Notepads hooks
export function useNotepads() {
  return useQuery({
    queryKey: ['notepads'],
    queryFn: () => db.getAllNotepads()
  });
}

export function useNotepadsByFolder(folderId: string | undefined) {
  return useQuery({
    queryKey: ['notepads', 'by-folder', folderId],
    queryFn: () => folderId ? db.getNotepadsByFolder(folderId) : Promise.resolve([]),
    enabled: !!folderId
  });
}

export function useNotepad(id: string | undefined) {
  return useQuery({
    queryKey: ['notepads', id],
    queryFn: () => id ? db.getNotepad(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useAddNotepad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notepad: Parameters<typeof db.addNotepad>[0]) => db.addNotepad(notepad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notepads'] });
    }
  });
}

export function useUpdateNotepad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notepad }: { id: string; notepad: Parameters<typeof db.updateNotepad>[1] }) =>
      db.updateNotepad(id, notepad),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notepads'] });
      queryClient.invalidateQueries({ queryKey: ['notepads', id] });
    }
  });
}

export function useDeleteNotepad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteNotepad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notepads'] });
    }
  });
}

// SnippetOrder hooks
export function useSnippetOrderByNotepad(notepadId: string | undefined) {
  return useQuery({
    queryKey: ['snippetOrders', 'by-notepad', notepadId],
    queryFn: () => notepadId ? db.getSnippetOrderByNotepad(notepadId) : Promise.resolve(null),
    enabled: !!notepadId
  });
}

export function useAddSnippetOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notepadId, snippetIds }: { notepadId: string; snippetIds: string[] }) =>
      db.addSnippetOrder(notepadId, snippetIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippetOrders'] });
    }
  });
}

export function useUpdateSnippetOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, snippetIds }: { id: string; snippetIds: string[] }) =>
      db.updateSnippetOrder(id, snippetIds),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['snippetOrders'] });
      queryClient.invalidateQueries({ queryKey: ['snippetOrders', 'by-notepad'] });
    }
  });
}

export function useDeleteSnippetOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteSnippetOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippetOrders'] });
    }
  });
}