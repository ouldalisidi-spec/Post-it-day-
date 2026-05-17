import { useCallback, useEffect, useRef, useState } from "react";
import { exportBoardToPdf } from "./exportBoardToPdf";
import { printBoard } from "./printBoard";
import PdfExportSettingsModal from "./components/PdfExportSettingsModal";
import { usePdfDocumentMeta } from "./hooks/usePdfDocumentMeta";
import type { PdfDocumentMeta } from "./pdfDocumentMeta";
import Board from "./components/Board";
import NoteModal from "./components/NoteModal";
import ProductionModeToggle from "./components/ProductionModeToggle";
import StartScreen from "./components/StartScreen";
import Toolbar from "./components/Toolbar";
import StatusBar from "./components/StatusBar";
import MeetingExportModal from "./components/MeetingExportModal";
import DisplayMode from "./components/DisplayMode";
import { exitDisplayFullscreen, requestDisplayFullscreen } from "./displayMode";
import { ProductionModeProvider } from "./context/ProductionModeContext";
import { useBoardState } from "./hooks/useBoardState";
import { useProductionMode } from "./hooks/useProductionMode";
import { openBoardFromDisk, readFileFromInput, supportsFileSystemAccess } from "./sharedFile";
import BoardDashboard from "./components/BoardDashboard";
import BoardFilterBar from "./components/BoardFilterBar";
import {
  countMatchingNotes,
  DEFAULT_BOARD_FILTERS,
  noteMatchesBoardFilters,
  type BoardFilters,
} from "./noteFilters";
import type { Note, NoteFormData } from "./types";

function AppContent() {
  const board = useBoardState();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const boardExportRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [meetingExportOpen, setMeetingExportOpen] = useState(false);
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  const [displayModeOpen, setDisplayModeOpen] = useState(false);
  const [boardFilters, setBoardFilters] = useState<BoardFilters>(
    DEFAULT_BOARD_FILTERS,
  );
  const pdfMeta = usePdfDocumentMeta();

  const noteFilter = useCallback(
    (note: Note) => noteMatchesBoardFilters(note, boardFilters),
    [boardFilters],
  );

  const visibleNoteCount = countMatchingNotes(board.notes, boardFilters);

  const enterDisplayMode = useCallback(async () => {
    setDisplayModeOpen(true);
    await requestDisplayFullscreen();
  }, []);

  const exitDisplayMode = useCallback(() => {
    setDisplayModeOpen(false);
    exitDisplayFullscreen();
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setDisplayModeOpen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!board.isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [board.isDirty]);

  const loadOpened = useCallback(
    async (opened: Awaited<ReturnType<typeof readFileFromInput>>) => {
      if (board.isDirty) {
        const proceed = window.confirm(
          "You have unsaved changes. Loading another file will discard them. Continue?",
        );
        if (!proceed) return false;
      }
      const ok = board.loadFromOpenedFile(opened);
      if (!ok) {
        window.alert(
          "Could not open this file. Ask your administrator for the correct team board file.",
        );
      }
      return ok;
    },
    [board],
  );

  const handleLoadOpenFile = useCallback(async () => {
    try {
      const opened = await openBoardFromDisk();
      if (!opened) return;
      await loadOpened(opened);
    } catch {
      window.alert("Could not open the selected file.");
    }
  }, [loadOpened]);

  const handleLoadUpload = useCallback(
    async (file: File) => {
      try {
        const opened = await readFileFromInput(file);
        await loadOpened(opened);
      } catch {
        window.alert("Failed to read the selected file.");
      }
    },
    [loadOpened],
  );

  const triggerUpload = () => uploadInputRef.current?.click();

  const handleOpenBoard = useCallback(async () => {
    if (supportsFileSystemAccess()) {
      await handleLoadOpenFile();
    } else {
      triggerUpload();
    }
  }, [handleLoadOpenFile]);

  const runPdfExport = useCallback(
    async (meta: PdfDocumentMeta) => {
      pdfMeta.setMeta(meta);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const root = boardExportRef.current;
      if (!root) {
        window.alert("Board is not ready for export.");
        return;
      }
      setIsExportingPdf(true);
      try {
        await exportBoardToPdf(root, board.boardFileName);
        setPdfSettingsOpen(false);
      } catch {
        window.alert("Could not create PDF. Try again or use Print from the browser.");
      } finally {
        setIsExportingPdf(false);
      }
    },
    [board.boardFileName, pdfMeta],
  );

  const handleSave = useCallback(async () => {
    try {
      await board.saveBoardFile();
    } catch {
      window.alert("Save failed. Try again.");
    }
  }, [board]);

  const openCreate = () => {
    setEditingNote(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleClear = () => {
    if (
      board.notes.length === 0 ||
      window.confirm(
        "Clear all notes from the board? Save the file afterward so the team sees the update.",
      )
    ) {
      board.clearBoard();
    }
  };

  const handleModalSave = (data: NoteFormData) => {
    if (modalMode === "create") {
      board.addNote(data);
    } else if (editingNote) {
      board.updateNote(editingNote.id, data);
    }
  };

  const handleChangeFile = () => {
    if (board.isDirty) {
      const proceed = window.confirm(
        "Unsaved changes will be lost. Return to file selection?",
      );
      if (!proceed) return;
    }
    window.location.reload();
  };

  const showStart = !board.hasLoadedBoard;

  const hiddenFileInput = (
    <input
      ref={uploadInputRef}
      type="file"
      accept=".json,application/json"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void handleLoadUpload(file);
        e.target.value = "";
      }}
    />
  );

  if (showStart) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b-4 border-slate-700 bg-board-header px-6 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Scheduling Board</h1>
              <p className="mt-1 text-base text-white/90">
                Team planning — no login required
              </p>
            </div>
            <ProductionModeToggle />
          </div>
        </header>
        <StartScreen
          onLoadFile={handleLoadOpenFile}
          onUploadFile={triggerUpload}
          onStartEmpty={board.startEmptyBoard}
        />
        {hiddenFileInput}
      </div>
    );
  }

  return (
    <>
    <div className="app-shell flex min-h-screen flex-col">
      <Toolbar
        noteCount={board.notes.length}
        isDirty={board.isDirty}
        canSaveInPlace={board.hasLinkedFile}
        onAddNote={openCreate}
        onClearBoard={handleClear}
        onSave={handleSave}
        onOpenBoard={handleOpenBoard}
        onLoadOpenFile={handleLoadOpenFile}
        onLoadUpload={handleLoadUpload}
        onChangeFile={handleChangeFile}
        onExportPdf={() => setPdfSettingsOpen(true)}
        isExportingPdf={isExportingPdf}
        onMeetingExport={() => setMeetingExportOpen(true)}
        onPrintBoard={printBoard}
        onDisplayMode={() => void enterDisplayMode()}
      />

      <StatusBar
        boardFileName={board.boardFileName}
        isDirty={board.isDirty}
        lastSaved={board.lastSaved}
        canSaveInPlace={board.hasLinkedFile}
        className="screen-only"
      />

      <BoardDashboard notes={board.notes} />

      <BoardFilterBar
        filters={boardFilters}
        totalNotes={board.notes.length}
        visibleNotes={visibleNoteCount}
        onChange={setBoardFilters}
        onClear={() => setBoardFilters(DEFAULT_BOARD_FILTERS)}
      />

      <main className="print-board-main flex-1 overflow-hidden p-3 md:p-4">
        <Board
          exportRootRef={boardExportRef}
          pdfMeta={pdfMeta.meta}
          notesByCell={board.notesByCell}
          noteFilter={noteFilter}
          onDragEnd={board.handleDragEnd}
          onEdit={openEdit}
          onDelete={board.deleteNote}
          onDuplicate={board.duplicateNoteById}
        />
      </main>

      <NoteModal
        open={modalOpen}
        mode={modalMode}
        initial={editingNote ?? undefined}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />

      {hiddenFileInput}
    </div>

      <MeetingExportModal
        open={meetingExportOpen}
        boardFileName={board.boardFileName}
        pdfMeta={pdfMeta.meta}
        onUpdatePdfMeta={pdfMeta.setMeta}
        notesByCell={board.notesByCell}
        onClose={() => setMeetingExportOpen(false)}
      />

      <PdfExportSettingsModal
        open={pdfSettingsOpen}
        initialMeta={pdfMeta.meta}
        onClose={() => setPdfSettingsOpen(false)}
        onExport={(meta) => void runPdfExport(meta)}
        isExporting={isExportingPdf}
      />

      <DisplayMode
        open={displayModeOpen}
        pdfMeta={pdfMeta.meta}
        notesByCell={board.notesByCell}
        onClose={exitDisplayMode}
      />
    </>
  );
}

export default function App() {
  const productionModeState = useProductionMode();

  return (
    <ProductionModeProvider value={productionModeState}>
      <AppContent />
    </ProductionModeProvider>
  );
}
