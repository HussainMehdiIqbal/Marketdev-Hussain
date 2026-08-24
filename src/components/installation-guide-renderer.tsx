type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; text: string; language?: string }
  | { type: "list"; items: string[] };

export function InstallationGuideRenderer({ content }: { content: unknown }) {
  if (!content) {
    return <p className="text-sm text-white/50">The installation guide for this project hasn&apos;t been published yet.</p>;
  }

  let textContent = "";
  if (typeof content === "string") {
    textContent = content;
  } else if (typeof content === "object" && content !== null) {
    if ("text" in content && typeof (content as { text?: unknown }).text === "string") {
      textContent = (content as { text: string }).text;
    }
  }

  if (textContent) {
    return (
      <div className="whitespace-pre-wrap font-[family-name:var(--font-mono)] text-sm leading-relaxed text-white/80">
        {textContent}
      </div>
    );
  }

  const blocks = Array.isArray(content) ? (content as Block[]) : [];

  if (blocks.length === 0) {
    return <p className="text-sm text-white/50">The installation guide for this project hasn&apos;t been published yet.</p>;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h3 key={i} className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              {block.text}
            </h3>
          );
        }
        if (block.type === "paragraph") {
          return <p key={i} className="text-sm leading-relaxed text-white/70">{block.text}</p>;
        }
        if (block.type === "code") {
          return (
            <pre key={i} className="overflow-x-auto rounded-lg border border-white/10 bg-surface-2 p-4 font-[family-name:var(--font-mono)] text-xs text-signal">
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-decimal space-y-1.5 pl-5 text-sm text-white/70">
              {block.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          );
        }
        return null;
      })}
    </div>
  );
}
