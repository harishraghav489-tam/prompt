"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { estimateTokens } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[390px] items-center justify-center rounded-md border border-slate-800 bg-[#0d1117] text-sm text-slate-400">
      Loading editor...
    </div>
  ),
});

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function PromptEditor({ value, onChange, readOnly = false }: PromptEditorProps) {
  const tokenEstimate = useMemo(() => estimateTokens(value), [value]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border border-[#1f2937] bg-[#0d1117]">
        <MonacoEditor
          height="390px"
          language="markdown"
          theme="vs-dark"
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            readOnly,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex gap-4">
          <span>Characters: {value.length}</span>
          <span>Tokens (est.): {tokenEstimate}</span>
        </div>
      </div>
    </div>
  );
}
