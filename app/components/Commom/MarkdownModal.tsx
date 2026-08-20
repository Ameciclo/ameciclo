import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import type { PluggableList } from "unified";

const remarkPlugins: PluggableList = [remarkGfm];
const rehypePlugins: PluggableList = [
  [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
];

interface MarkdownModalProps {
  title: string;
  content: string;
  trigger?: string;
}

export function MarkdownModal({ title, content, trigger }: MarkdownModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block mt-3 px-4 py-1.5 text-xs font-semibold text-ameciclo border border-ameciclo rounded-sm hover:bg-ameciclo hover:text-white transition-colors"
      >
        {trigger || "Saiba mais"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-ameciclo px-6 py-4 text-white rounded-t-lg sticky top-0 z-10 flex items-center justify-between">
              <h3 className="font-semibold text-lg">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-white hover:bg-black/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
