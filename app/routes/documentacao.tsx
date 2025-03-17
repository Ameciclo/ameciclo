import { marked } from "marked";
import fs from "fs";
import path from "path";

const content = fs.readFileSync(path.resolve("documentation/documentation_dev.md"), "utf-8");

export default function Docs() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div
        className="prose prose-lg border p-4 rounded bg-gray-100"
        dangerouslySetInnerHTML={{ __html: marked(content) }}
      />
    </div>
  );
}