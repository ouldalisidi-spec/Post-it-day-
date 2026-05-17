export async function requestDisplayFullscreen(): Promise<boolean> {
  try {
    if (!document.fullscreenEnabled) return false;
    await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}

export function exitDisplayFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  }
}
