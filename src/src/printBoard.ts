const PRINT_CLASS = "board-print-active";

export function printBoard(): void {
  document.body.classList.add(PRINT_CLASS);

  const cleanup = () => {
    document.body.classList.remove(PRINT_CLASS);
  };

  window.addEventListener("afterprint", cleanup, { once: true });

  window.print();
}
