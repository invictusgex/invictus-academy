import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const FILE_EXTENSIONS = new Set([".ts", ".tsx"]);

const TERMS = [
  "Formacion",
  "formacion",
  "Mentoria",
  "mentoria",
  "Configuracion",
  "configuracion",
  "Modulo",
  "modulo",
  "Modulos",
  "modulos",
  "Sesion",
  "sesion",
  "Practica",
  "practica",
  "Preparacion",
  "preparacion",
  "Informacion",
  "informacion",
  "Metodologia",
  "metodologia",
  "Interpretacion",
  "interpretacion",
  "Proxima",
  "proxima",
  "Proximamente",
  "proximamente",
  "Academico",
  "academico",
  "Analisis",
  "analisis",
  "Pagina",
  "pagina",
  "Contrasena",
  "contrasena",
  "Tambien",
  "tambien",
  "Segun",
  "segun",
  "Aun",
  "aun",
  "Accion",
  "accion",
  "Conclusion",
  "conclusion",
  "Cancelacion",
  "cancelacion",
  "Confirmacion",
  "confirmacion",
  "Actualizacion",
  "actualizacion",
  "Descripcion",
  "descripcion",
  "Duracion",
  "duracion",
  "Exposicion",
  "exposicion",
  "Administracion",
  "administracion",
  "Programacion",
  "programacion",
  "Reflexion",
  "reflexion",
  "Personalizacion",
  "personalizacion",
  "Sintesis",
  "sintesis",
  "Admision",
  "admision",
  "recibiras",
];

const TERM_PATTERN = new RegExp(`\\b(${TERMS.join("|")})\\b`);

const TECHNICAL_ALLOWLIST = [
  /href=["'{`]#(?:modulos|mentoria)["'`}]/,
  /id=["'{`](?:modulos|mentoria)["'`}]/,
  /href=["'{`]\/academy\/mentoria["'`}]/,
  /revalidatePath\(["'`]\/academy\/mentoria["'`]\)/,
  /id:\s*["'`]modulo-\d+(?:-video(?:-\d+)?)?["'`]/,
  /moduleId|module_key|moduleKey|slug|href|pathname|redirectTo|encodeURIComponent/,
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile() && FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function isCommentOnly(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

function isTechnicalException(line) {
  return TECHNICAL_ALLOWLIST.some((pattern) => pattern.test(line));
}

const files = await walk(SRC_DIR);
const findings = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!TERM_PATTERN.test(line)) return;
    if (isCommentOnly(line)) return;
    if (isTechnicalException(line)) return;

    findings.push({
      file: path.relative(ROOT, file).replaceAll(path.sep, "/"),
      line: index + 1,
      text: line.trim(),
    });
  });
}

if (findings.length > 0) {
  console.error("Se encontraron posibles textos visibles en español sin tilde:");
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} ${finding.text}`);
  }
  process.exit(1);
}

console.log(`Spanish copy check passed. ${files.length} archivos revisados.`);
