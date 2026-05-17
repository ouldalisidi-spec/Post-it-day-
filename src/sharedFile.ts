export interface OpenedBoardFile {
  name: string;
  content: string;
  handle: FileSystemFileHandle | null;
}

export function supportsFileSystemAccess(): boolean {
  return (
    typeof window !== "undefined" &&
    "showOpenFilePicker" in window &&
    "showSaveFilePicker" in window
  );
}

export async function openBoardFromDisk(): Promise<OpenedBoardFile | null> {
  if (supportsFileSystemAccess()) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Scheduling board",
            accept: { "application/json": [".json"] },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      return {
        name: file.name,
        content: await file.text(),
        handle,
      };
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return null;
      throw err;
    }
  }
  return null;
}

export async function saveBoardToDisk(
  content: string,
  options: {
    handle: FileSystemFileHandle | null;
    suggestedName: string;
  },
): Promise<{ name: string; handle: FileSystemFileHandle | null }> {
  const blob = new Blob([content], { type: "application/json" });

  if (options.handle) {
    const writable = await options.handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return { name: options.handle.name, handle: options.handle };
  }

  if (supportsFileSystemAccess()) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: options.suggestedName,
        types: [
          {
            description: "Scheduling board",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { name: handle.name, handle };
    } catch (err) {
      if ((err as DOMException).name === "AbortError") {
        throw new SaveCancelledError();
      }
      throw err;
    }
  }

  downloadBoardJson(content, options.suggestedName);
  return { name: options.suggestedName, handle: null };
}

export function downloadBoardJson(content: string, filename: string): void {
  const safeName = filename.endsWith(".json") ? filename : `${filename}.json`;
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export class SaveCancelledError extends Error {
  constructor() {
    super("Save cancelled");
    this.name = "SaveCancelledError";
  }
}

export async function readFileFromInput(file: File): Promise<OpenedBoardFile> {
  return {
    name: file.name,
    content: await file.text(),
    handle: null,
  };
}
