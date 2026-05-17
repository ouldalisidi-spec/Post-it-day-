import { useCallback, useRef, useState } from "react";
import { duplicateNote, createNote, nextOrderInCell } from "../noteUtils";
import {
  buildBoardState,
  DEFAULT_BOARD_FILENAME,
  parseImportedFile,
  serializeBoard,
} from "../storage";
import {
  SaveCancelledError,
  saveBoardToDisk,
  type OpenedBoardFile,
} from "../sharedFile";
import type { ColumnId, Note, NoteFormData, RowId } from "../types";
import { parseCellId } from "../types";

export function useBoardState() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [boardFileName, setBoardFileName] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasLoadedBoard, setHasLoadedBoard] = useState(false);
  const [hasLinkedFile, setHasLinkedFile] = useState(false);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const applyBoard = useCallback(
    (
      nextNotes: Note[],
      fileName: string,
      handle: FileSystemFileHandle | null,
      savedAt: string,
    ) => {
      setNotes(nextNotes);
      setBoardFileName(fileName);
      fileHandleRef.current = handle;
      setHasLinkedFile(handle !== null);
      setLastSaved(savedAt);
      setIsDirty(false);
      setHasLoadedBoard(true);
    },
    [],
  );

  const loadFromOpenedFile = useCallback((opened: OpenedBoardFile): boolean => {
    const state = parseImportedFile(opened.content, opened.name);
    if (!state) return false;
    applyBoard(
      state.notes,
      opened.name,
      opened.handle,
      state.savedAt,
    );
    return true;
  }, [applyBoard]);

  const startEmptyBoard = useCallback(() => {
    applyBoard([], DEFAULT_BOARD_FILENAME, null, new Date().toISOString());
  }, [applyBoard]);

  const addNote = useCallback(
    (data: NoteFormData) => {
      setNotes((prev) => {
        const order = nextOrderInCell(prev, data.rowId, data.columnId);
        return [...prev, createNote({ ...data, order })];
      });
      markDirty();
    },
    [markDirty],
  );

  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const next: Note = {
            ...n,
            ...patch,
            updatedAt: new Date().toISOString(),
          };
          if ("dueDate" in patch && !patch.dueDate) {
            delete next.dueDate;
          }
          return next;
        }),
      );
      markDirty();
    },
    [markDirty],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      markDirty();
    },
    [markDirty],
  );

  const duplicateNoteById = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const source = prev.find((n) => n.id === id);
        if (!source) return prev;
        const order = nextOrderInCell(prev, source.rowId, source.columnId);
        return [...prev, duplicateNote(source, order)];
      });
      markDirty();
    },
    [markDirty],
  );

  const moveNoteToCell = useCallback(
    (noteId: string, rowId: RowId, columnId: ColumnId, order?: number) => {
      setNotes((prev) => {
        const nextOrder = order ?? nextOrderInCell(prev, rowId, columnId);
        return prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                rowId,
                columnId,
                order: nextOrder,
                updatedAt: new Date().toISOString(),
              }
            : n,
        );
      });
      markDirty();
    },
    [markDirty],
  );

  const handleDragEnd = useCallback(
    (activeId: string, overId: string | null) => {
      if (!overId || activeId === overId) return;

      const targetCell = parseCellId(overId);
      if (targetCell) {
        moveNoteToCell(activeId, targetCell.rowId, targetCell.columnId);
        return;
      }

      const overNote = notes.find((n) => n.id === overId);
      if (overNote) {
        moveNoteToCell(
          activeId,
          overNote.rowId,
          overNote.columnId,
          overNote.order - 0.5,
        );
      }
    },
    [moveNoteToCell, notes],
  );

  const clearBoard = useCallback(() => {
    setNotes([]);
    markDirty();
  }, [markDirty]);

  const getSerializedBoard = useCallback(() => {
    return serializeBoard(
      buildBoardState(notes, boardFileName ?? DEFAULT_BOARD_FILENAME),
    );
  }, [notes, boardFileName]);

  const saveBoardFile = useCallback(async (): Promise<boolean> => {
    try {
      const content = getSerializedBoard();
      const result = await saveBoardToDisk(content, {
        handle: fileHandleRef.current,
        suggestedName: boardFileName ?? DEFAULT_BOARD_FILENAME,
      });
      fileHandleRef.current = result.handle;
      setHasLinkedFile(result.handle !== null);
      setBoardFileName(result.name);
      const savedAt = new Date().toISOString();
      setLastSaved(savedAt);
      setIsDirty(false);
      return true;
    } catch (err) {
      if (err instanceof SaveCancelledError) return false;
      throw err;
    }
  }, [getSerializedBoard, boardFileName]);

  const loadBoardFile = useCallback(
    (opened: OpenedBoardFile): boolean => {
      return loadFromOpenedFile(opened);
    },
    [loadFromOpenedFile],
  );

  const notesByCell = useCallback(
    (rowId: RowId, columnId: ColumnId) =>
      notes
        .filter((n) => n.rowId === rowId && n.columnId === columnId)
        .sort((a, b) => a.order - b.order),
    [notes],
  );

  return {
    notes,
    boardFileName,
    lastSaved,
    isDirty,
    hasLoadedBoard,
    hasLinkedFile,
    addNote,
    updateNote,
    deleteNote,
    duplicateNoteById,
    handleDragEnd,
    clearBoard,
    saveBoardFile,
    loadBoardFile,
    loadFromOpenedFile,
    startEmptyBoard,
    notesByCell,
    getSerializedBoard,
  };
}
