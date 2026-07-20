"use client";

export function ExportButton() {
  const handleExport = () => {
    window.location.href = "/api/admin/analytics/export";
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 cursor-pointer"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export All Orders (CSV)
    </button>
  );
}
