import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";

async function load(path, mocks) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const context = { exports: {}, require(id) { assert.ok(id in mocks, `Unexpected dependency: ${id}`); return mocks[id]; } };
  vm.runInNewContext(code, context);
  return context.exports;
}
const liveRoom = { publicHref: "/sala-en-vivo" };
const { academyNavigation } = await load("../src/lib/academy.ts", {
  "@/content/live-room": { liveRoom },
  "@/lib/services/academy-content.service": { AcademyContentService: {} },
});
let isAdmin = false;
const { AcademySidebar } = await load("../src/components/layout/academy-sidebar.tsx", {
  "react/jsx-runtime": jsxRuntime,
  "next/image": ({ alt, ...props }) => React.createElement("img", { alt, ...props }),
  "next/link": (props) => React.createElement("a", props),
  "next/navigation": { usePathname: () => "/academy" },
  "@/components/landing/live-room.module.css": { live: "live", link: "live-link" },
  "@/content/live-room": { liveRoom },
  "@/contexts/AdminContext": { useAdminContext: () => ({ isAdmin }) },
  "@/utils/class-names": { classNames: (...values) => values.filter(Boolean).join(" ") },
});
for (const admin of [false, true]) {
  isAdmin = admin;
  const html = renderToStaticMarkup(React.createElement(AcademySidebar, { navigation: academyNavigation }));
  assert.match(html, /href="\/sala-en-vivo"[^>]*>Sala en vivo<\/a>/);
  assert.match(html, /live live-link/);
  assert.match(html, /href="\/"/);
  assert.equal(html.includes('href="/admin"'), admin);
}
console.log("PASS: academy students and admins can navigate to the independent live-room subscription and home.");
