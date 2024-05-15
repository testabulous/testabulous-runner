#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/.pnpm/tsup@8.0.1_postcss@8.4.33_typescript@5.3.3/node_modules/tsup/assets/esm_shims.js
import { fileURLToPath } from "url";
import path from "path";
var getFilename = () => fileURLToPath(import.meta.url);
var getDirname = () => path.dirname(getFilename());
var __dirname = /* @__PURE__ */ getDirname();

// src/index.ts
import chalk10 from "chalk";
import figlet from "figlet";
import { Command } from "commander";

// src/runner/index.ts
import fs5 from "fs/promises";
import chalk8 from "chalk";
import { createHash as createHash2 } from "node:crypto";

// src/lib/db.ts
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path2 from "path";

// src/lib/schema.ts
var schema_exports = {};
__export(schema_exports, {
  callsTable: () => callsTable,
  clausesTable: () => clausesTable,
  definitionsTable: () => definitionsTable,
  scriptDataTable: () => scriptDataTable,
  scriptsTable: () => scriptsTable,
  testSpecsTable: () => testSpecsTable
});
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";
var scriptsTable = sqliteTable("scripts", {
  id: text("id").notNull().primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  status: integer("status").notNull(),
  name: text("name").notNull(),
  uri: text("uri").notNull(),
  scriptType: text("script_type").notNull()
});
var scriptDataTable = sqliteTable(
  "script_data",
  {
    id: text("id").notNull().primaryKey(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    status: integer("status").notNull(),
    hash: text("hash").notNull(),
    scriptId: text("script_id").notNull()
  },
  (table) => {
    return {
      hashIdx: index("hash_idx").on(table.hash)
    };
  }
);
var testSpecsTable = sqliteTable("test_specs", {
  id: text("id").notNull().primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  status: integer("status").notNull(),
  scriptDataId: text("script_data_id").notNull(),
  name: text("name").notNull(),
  description: text("description")
});
var definitionsTable = sqliteTable("definitions", {
  id: text("id").notNull().primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  status: integer("status").notNull(),
  testSpecId: text("test_spec_id").notNull(),
  name: text("name").notNull(),
  line: integer("line").notNull(),
  type: integer("type").notNull().default(0)
});
var clausesTable = sqliteTable("clauses", {
  id: text("id").notNull().primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  status: integer("status").notNull(),
  parentId: text("parent_id").notNull(),
  type: integer("type").notNull(),
  line: integer("line").notNull(),
  clause: text("clause").notNull()
});
var callsTable = sqliteTable("calls", {
  id: text("id").notNull().primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  status: integer("status").notNull(),
  testSpecDefinitionId: text("test_spec_definition_id").notNull(),
  testSpecClauseId: text("test_spec_clause_id").notNull(),
  externalId: text("external_id"),
  call: text("call").notNull(),
  params: text("params").notNull()
});

// src/lib/db.ts
import chalk from "chalk";
var sqlite = null;
var drizzleInstance = null;
var getDatabase = (dbPath) => {
  if (drizzleInstance === null) {
    if (sqlite === null) {
      sqlite = new Database(path2.join(dbPath, "testabulous.db"));
    }
    drizzleInstance = drizzle(sqlite, { schema: schema_exports, logger: false });
  }
  return drizzleInstance;
};
var closeDatabase = () => {
  console.log(chalk.yellow(`\u{1F44D} Closing database`));
  if (drizzleInstance != null) {
    drizzleInstance = null;
  }
  if (sqlite != null) {
    sqlite.close();
    sqlite = null;
  }
};
var migrateDatabase = async (dbPath) => {
  const db = getDatabase(dbPath);
  try {
    const dir = path2.join(__dirname, "..", "drizzle");
    console.log(chalk.greenBright(`Migrating databases from: ${dir}`));
    await migrate(db, { migrationsFolder: dir });
  } catch (e) {
    console.log(chalk.redBright(`\u{1F915} Migrating database: ${e}`));
  }
};
async function findScriptByHash(hash, db) {
  const dataRows = await db.select().from(scriptDataTable).where(eq(scriptDataTable.hash, hash));
  if (dataRows.length === 0) {
    return null;
  }
  const scriptData = dataRows[0];
  const scriptRows = await db.select().from(scriptsTable).where(eq(scriptsTable.id, scriptData.scriptId));
  if (scriptRows.length === 0) {
    return null;
  }
  const script = scriptRows[0];
  script.scriptData = scriptData;
  return script;
}
async function findScriptDataByHash(hash, db) {
  const rows = await db.select().from(scriptDataTable).where(eq(scriptDataTable.hash, hash));
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}
async function findTestSpecByScriptDataId(scriptDataId, db) {
  const rows = await db.select().from(testSpecsTable).where(eq(testSpecsTable.scriptDataId, scriptDataId));
  if (rows.length === 0) {
    return null;
  }
  const testSpec = rows[0];
  const topGivens = await db.select().from(clausesTable).where(and(eq(clausesTable.parentId, testSpec.id), eq(clausesTable.type, 1 /* TopLevelGiven */))).orderBy(clausesTable.line);
  testSpec.givens = topGivens;
  const defs = await db.select().from(definitionsTable).where(eq(definitionsTable.testSpecId, testSpec.id)).orderBy(definitionsTable.line);
  testSpec.definitions = defs;
  for (const d of testSpec.definitions) {
    const givens = await db.select().from(clausesTable).where(and(eq(clausesTable.parentId, d.id), eq(clausesTable.type, 2 /* TestGiven */))).orderBy(clausesTable.line);
    d.givens = givens;
    const steps = await db.select().from(clausesTable).where(and(eq(clausesTable.parentId, d.id), eq(clausesTable.type, 0 /* Step */))).orderBy(clausesTable.line);
    d.steps = steps;
    const calls = await db.select().from(callsTable).where(eq(callsTable.testSpecDefinitionId, d.id));
    d.calls = calls;
  }
  return testSpec;
}

// src/cache/index.ts
import fs3 from "fs/promises";
import chalk4 from "chalk";
import { eq as eq2, inArray } from "drizzle-orm";
import { createHash } from "node:crypto";
import axios from "axios";

// src/lib/utils.ts
import fs2 from "fs/promises";
import path4 from "path";
import chalk3 from "chalk";

// src/config.ts
import fs from "fs/promises";
import path3 from "path";
import chalk2 from "chalk";
import untildify from "untildify";
import { z } from "zod";
var BrowserTypeEnum = z.enum(["chrome", "MicrosoftEdge", "firefox", "internet explorer", "safari"]);
var ConfigFileSchema = z.object({
  projectId: z.string().optional(),
  apiKey: z.string().optional(),
  baseDir: z.string().optional().default("testabulous"),
  uiPort: z.number().optional().default(4e3),
  apiBaseURL: z.string().url().optional().default("https://testabulous.com/api/v1"),
  screenshots: z.boolean().optional().default(false),
  uploadResults: z.boolean().optional().default(false),
  browser: z.object({
    browser: BrowserTypeEnum.optional().default("chrome"),
    headless: z.boolean().optional().default(false),
    windowSize: z.object({
      width: z.number().optional().default(1920),
      height: z.number().optional().default(1080)
    }).optional()
  }).optional().default({
    browser: "chrome",
    headless: true,
    windowSize: { width: 1920, height: 1080 }
  }),
  envFile: z.string().optional()
});
var defaultConfig = {
  rootDir: process.cwd(),
  baseDir: "testabulous",
  testsDir: "./tests",
  cacheDir: "./cache",
  logsDir: "./logs",
  scriptsDir: "./scripts",
  screenshotsDir: "./screenshots",
  force: false,
  debug: false,
  procedures: []
};
async function BuildConfig(opts, localOpts) {
  let c = { ...defaultConfig, ...ConfigFileSchema.parse({}), ...localOpts };
  if (opts.rootDir && opts.configFile) {
    throw new Error("Cannot specify both --root-dir and --config-file");
  }
  let rootDir = c.rootDir;
  let configFile = "testabulous.config.json";
  if (opts.rootDir) {
    rootDir = untildify(opts.rootDir);
    configFile = path3.join(rootDir, "testabulous.config.json");
  } else if (opts.configFile) {
    rootDir = path3.resolve(process.cwd(), path3.dirname(untildify(opts.configFile)));
    configFile = path3.resolve(process.cwd(), untildify(opts.configFile));
  }
  c.rootDir = path3.isAbsolute(rootDir) ? rootDir : path3.resolve(process.cwd(), rootDir);
  console.log(chalk2.greenBright(`Using root directory ${c.rootDir}`));
  const configFileExists = await fileExists(configFile);
  if (configFileExists) {
    try {
      const data = await fs.readFile(configFile, { encoding: "utf-8" });
      const localConfig = ConfigFileSchema.parse(JSON.parse(data));
      c = { ...c, ...localConfig };
      console.log(chalk2.greenBright(`\u{1F680} Loaded config file ${configFile}`));
    } catch (e) {
      throw `Config file ${opts.configFile} is not parsable: ${e}`;
    }
  } else {
    console.log(chalk2.yellow(`\u{1F915} Configuration file not found, using defaults`));
  }
  if (opts.envFile) {
    c.envFile = opts.envFile;
  }
  if (c.envFile) {
    c.envFile = path3.resolve(c.rootDir, c.envFile);
    const envFileExists = await fileExists(c.envFile);
    if (envFileExists) {
      await loadEnvFile(c.envFile);
      console.log(chalk2.greenBright(`\u{1F680} Loaded environment file ${c.envFile}`));
    } else {
      throw new Error(`\u{1F915} Environment file ${c.envFile} not found`);
    }
  }
  c.apiBaseURL = process.env.TESTABULOUS_API_BASE_URL || c.apiBaseURL;
  c.projectId = process.env.TESTABULOUS_PROJECT_ID || c.projectId;
  c.taskId = process.env.TESTABULOUS_TASK_ID;
  c.apiKey = process.env.TESTABULOUS_API_KEY || c.apiKey;
  c.testScriptDataId = process.env.TESTABULOUS_TEST_SCRIPT_DATA_ID;
  if (process.env.TESTABULOUS_UPLOAD_RESULTS) {
    c.uploadResults = (process.env.TESTABULOUS_UPLOAD_RESULTS || "false").toLowerCase() === "true";
  }
  if (opts.projectId) {
    c.projectId = opts.projectId;
  }
  if (opts.apiKey) {
    c.apiKey = opts.apiKey;
  }
  if (opts.port) {
    c.uiPort = opts.port;
  }
  if (c.projectId === "") {
    throw "A Project ID is required";
  }
  if (c.apiKey === "") {
    throw "An API key is required";
  }
  c.testsDir = path3.resolve(c.rootDir, c.baseDir, c.testsDir);
  c.cacheDir = path3.resolve(c.rootDir, c.baseDir, c.cacheDir);
  c.logsDir = path3.resolve(c.rootDir, c.baseDir, c.logsDir);
  c.scriptsDir = path3.resolve(c.rootDir, c.baseDir, c.scriptsDir);
  c.screenshotsDir = path3.resolve(c.rootDir, c.baseDir, c.screenshotsDir);
  await fs.mkdir(c.rootDir, { recursive: true });
  await fs.mkdir(c.testsDir, { recursive: true });
  await fs.mkdir(c.cacheDir, { recursive: true });
  await fs.mkdir(c.logsDir, { recursive: true });
  await fs.mkdir(c.scriptsDir, { recursive: true });
  await fs.mkdir(c.screenshotsDir, { recursive: true });
  return c;
}
async function loadEnvFile(file) {
  try {
    const data = await fs.readFile(file, { encoding: "utf-8" });
    data.split("\n").forEach((line) => {
      line = line.trim();
      if (line.length === 0)
        return;
      if (line.startsWith("#"))
        return;
      if (line.startsWith("//"))
        return;
      const ix = line.indexOf("#");
      if (ix > -1) {
        line = line.substring(0, ix).trim();
      }
      const [key, value] = line.split("=");
      if (key && value) {
        process.env[key] = value;
      } else {
        throw new Error(`\u{1F915} Could not parse environment file ${file}: malformed (${line})`);
      }
    });
  } catch (e) {
    throw new Error(`\u{1F915} Could not parse environment file ${file}`);
  }
}
async function fileExists(file) {
  return fs.stat(file).then(() => true).catch(() => false);
}

// src/lib/utils.ts
async function getTargetFiles(cfg) {
  let testFiles = [];
  if (cfg.file) {
    const p = path4.isAbsolute(cfg.file) ? cfg.file : path4.resolve(cfg.testsDir, cfg.file);
    const exists = await fileExists(p);
    if (exists) {
      testFiles.push(p);
      return testFiles;
    }
    throw `File ${cfg.file} not found`;
  } else {
    console.log(chalk3.blueBright(`\u23F3 Looking for test files in ${cfg.testsDir}`));
    testFiles = await walkDirs(cfg.testsDir);
    console.log(chalk3.blueBright(`\u{1F44D} Found ${testFiles.length} test files`));
  }
  if (testFiles.length === 0) {
    throw "No test files found";
  }
  return testFiles;
}
async function walkDirs(source) {
  const dirs = await fs2.readdir(source);
  const files = [];
  for (const d of dirs) {
    const p = path4.join(source, d);
    const stat = await fs2.stat(p);
    if (stat.isDirectory()) {
      const children = await walkDirs(p);
      files.push(...children);
    } else if (p.toLocaleLowerCase().endsWith(".md")) {
      files.push(p);
    }
  }
  return files;
}

// src/cache/index.ts
async function Cache(cfg) {
  try {
    const testFiles = await getTargetFiles(cfg);
    const db = getDatabase(cfg.cacheDir);
    await cacheFiles(testFiles, cfg, db);
  } catch (e) {
    console.log(chalk4.redBright(`\u{1F915} Caching files failed: ${e}`));
  } finally {
    closeDatabase();
  }
}
async function cacheFiles(files, cfg, db) {
  const scripts = [];
  for (const f of files) {
    scripts.push(await cacheFile(f, cfg, db));
  }
  for (const script of scripts) {
    if (script.scriptData.status === 1 /* Active */) {
      continue;
    }
    console.log(chalk4.blueBright(`Waiting for processing of ${script.name} to complete`));
    await pollForActiveScript(script.id, script.scriptData.id, cfg, db);
  }
}
async function cacheFile(file, cfg, db) {
  console.log(chalk4.blueBright(`Processing ${file}`));
  if (cfg.force) {
    console.log(chalk4.blueBright(`Forcing re-cache of ${file}`));
  }
  try {
    const scriptText = await fs3.readFile(file, { encoding: "utf-8" });
    const req = {
      uri: `file://${file}`,
      data: scriptText,
      scriptType: "markdown",
      forceParse: cfg.force
    };
    const hash = createHash("sha256").update(scriptText).digest("base64");
    const existingScript = await findScriptByHash(hash, db);
    if (!cfg.force) {
      if (existingScript && existingScript.status === 1 /* Active */) {
        console.log(chalk4.greenBright(`\u{1F44D} ${file} already cached`));
        return existingScript;
      }
    }
    const { data: script } = await axios.post(`${cfg.apiBaseURL}/projects/${cfg.projectId}/scripts`, req, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      }
    });
    await saveScript(script, db);
    console.log(chalk4.greenBright(`\u{1F44D} ${file} cached`));
    return script;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response && e.response.status === 402) {
        throw "You have insufficient credits, please top up your account";
      }
    }
    console.log(chalk4.redBright(`\u{1F915} Processing ${file}: ${e}`));
    throw e;
  }
}
async function pollForActiveScript(scriptId, scriptDataId, cfg, db) {
  return new Promise((resolve, reject) => {
    const start = /* @__PURE__ */ new Date();
    const timer = setInterval(async () => {
      try {
        console.log(chalk4.blueBright(`Polling for script ${scriptId}`));
        const { status, data: script } = await axios.get(
          `${cfg.apiBaseURL}/projects/${cfg.projectId}/scripts/${scriptId}/data/${scriptDataId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${cfg.apiKey}`
            }
          }
        );
        if (status !== 200) {
          throw `Server returned ${status}`;
        }
        await saveScript(script, db);
        if (script.scriptData.status === 1 /* Active */) {
          console.log(chalk4.greenBright(`\u{1F44D} ${script.id} cached`));
          clearTimeout(timer);
          resolve(script);
          return;
        }
        const now = /* @__PURE__ */ new Date();
        if (now.getTime() - start.getTime() > 6e4) {
          clearTimeout(timer);
          reject(`Timeout waiting for completion of ${scriptId}`);
        }
      } catch (e) {
        console.log(chalk4.redBright(`\u{1F915} Polling for active script ${scriptId}: ${e}`));
        throw e;
      }
    }, 5e3);
  });
}
async function saveScript(script, db) {
  await db.transaction(async (tx) => {
    const existingScript = await tx.select().from(scriptsTable).where(eq2(scriptsTable.id, script.id));
    if (existingScript.length === 0) {
      await tx.insert(scriptsTable).values({
        id: script.id,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt,
        status: script.status,
        name: script.name,
        uri: script.uri,
        scriptType: script.scriptType
      });
    } else {
      await tx.update(scriptsTable).set({
        updatedAt: script.updatedAt,
        status: script.status,
        name: script.name
      }).where(eq2(scriptsTable.id, script.id));
    }
    const existingData = await tx.select().from(scriptDataTable).where(eq2(scriptDataTable.id, script.scriptData.id));
    if (existingData.length === 0) {
      await tx.insert(scriptDataTable).values({
        id: script.scriptData.id,
        createdAt: script.scriptData.createdAt,
        updatedAt: script.scriptData.updatedAt,
        status: script.scriptData.status,
        hash: script.scriptData.hash,
        scriptId: script.id
      });
    } else {
      await tx.update(scriptDataTable).set({
        updatedAt: script.scriptData.updatedAt,
        status: script.scriptData.status
      }).where(eq2(scriptDataTable.id, script.scriptData.id));
    }
    if (script.scriptData.spec) {
      const existingSpec = await tx.select().from(testSpecsTable).where(eq2(testSpecsTable.id, script.scriptData.spec.id));
      if (existingSpec.length === 0) {
        await tx.insert(testSpecsTable).values({
          id: script.scriptData.spec.id,
          createdAt: script.scriptData.spec.createdAt,
          updatedAt: script.scriptData.spec.updatedAt,
          status: script.scriptData.spec.status,
          scriptDataId: script.scriptData.id,
          name: script.scriptData.spec.name,
          description: script.scriptData.spec.description
        });
      } else {
        await tx.update(testSpecsTable).set({
          updatedAt: script.scriptData.spec.updatedAt,
          status: script.scriptData.spec.status,
          name: script.scriptData.spec.name,
          description: script.scriptData.spec.description
        }).where(eq2(testSpecsTable.id, script.scriptData.spec.id));
      }
      const q1 = tx.select({ data: definitionsTable.id }).from(definitionsTable).where(eq2(definitionsTable.testSpecId, script.scriptData.spec.id));
      await tx.delete(clausesTable).where(inArray(clausesTable.parentId, q1));
      await tx.delete(callsTable).where(inArray(callsTable.testSpecDefinitionId, q1));
      await tx.delete(definitionsTable).where(eq2(definitionsTable.testSpecId, script.scriptData.spec.id));
      await tx.delete(clausesTable).where(eq2(clausesTable.parentId, script.scriptData.spec.id));
      if (script.scriptData.spec.givens) {
        for (const g of script.scriptData.spec.givens) {
          await tx.insert(clausesTable).values({
            id: g.id,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
            status: g.status,
            parentId: script.scriptData.spec.id,
            type: g.type,
            line: g.line,
            clause: g.clause
          });
        }
      }
      for (const d of script.scriptData.spec.definitions) {
        await tx.insert(definitionsTable).values({
          id: d.id,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          status: d.status,
          testSpecId: d.testSpecId,
          name: d.name,
          line: d.line,
          type: d.type
        });
        if (d.givens) {
          for (const g of d.givens) {
            await tx.insert(clausesTable).values({
              id: g.id,
              createdAt: g.createdAt,
              updatedAt: g.updatedAt,
              status: g.status,
              parentId: d.id,
              type: g.type,
              line: g.line,
              clause: g.clause
            });
          }
        }
        if (d.steps) {
          for (const s of d.steps) {
            await tx.insert(clausesTable).values({
              id: s.id,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
              status: s.status,
              parentId: d.id,
              type: s.type,
              line: s.line,
              clause: s.clause
            });
          }
        }
        if (d.calls) {
          for (const c of d.calls) {
            await tx.insert(callsTable).values({
              id: c.id,
              createdAt: c.createdAt,
              updatedAt: c.updatedAt,
              status: c.status,
              testSpecDefinitionId: c.testSpecDefinitionId,
              testSpecClauseId: c.testSpecClauseId,
              externalId: c.externalId,
              call: c.call,
              params: c.params
            });
          }
        }
      }
    }
  });
}

// src/runner/calls.ts
import { setInterval as setInterval3 } from "timers/promises";
import path5 from "path";
import chalk6 from "chalk";

// src/runner/utils.ts
import { setInterval as setInterval2 } from "timers/promises";
import { By } from "selenium-webdriver";
import { error } from "selenium-webdriver";
import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";
import axios2 from "axios";
import chalk5 from "chalk";
var defaultAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var includeAlphabet = /* @__PURE__ */ new Map([
  ["l", "abcdefghijklmnopqrstuvwxyz"],
  ["L", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
  ["n", "0123456789"],
  ["s", "!@#$%^&*()_+"]
]);
function randomString(spec) {
  let lenSpec = "";
  let charSpec = "";
  for (const s of spec) {
    if (/\d/.test(s)) {
      lenSpec += s;
      continue;
    }
    if (includeAlphabet.has(s)) {
      charSpec += includeAlphabet.get(s);
    }
  }
  let len = 8;
  if (lenSpec > "") {
    len = parseInt(lenSpec);
  }
  let chars = charSpec;
  if (charSpec === "") {
    chars = defaultAlphabet;
  }
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
var functions = /* @__PURE__ */ new Map();
functions.set("_random", randomString);
function dereferenceArgument(ctx, val) {
  let result = val;
  const matches = val.match(/\{\{.+?\}\}/g);
  if (matches) {
    for (const m of matches) {
      const key = m.substring(2, m.length - 2).substring(0, m.length - 2).trim();
      if (ctx.metadata[key]) {
        result = result.replace(m, ctx.metadata[key]);
        continue;
      }
      if (/^['"“”].*['"“”]$/.test(key)) {
        result = key.substring(1, key.length - 1);
        continue;
      }
      if (/_\w+\(.*?\)/.test(key)) {
        const els = key.split(/[()]/).filter((el) => el.length > 0);
        if (functions.has(els[0])) {
          const fn = functions.get(els[0]);
          if (els.length > 1) {
            result = result.replace(m, fn(els[1]));
            continue;
          }
          result = result.replace(m, fn());
        }
      }
    }
  }
  return result;
}
async function executeWithTimeout(cb, timeout) {
  return new Promise((resolve, reject) => {
    ;
    (async () => {
      let lastResult = null;
      for await (const start of setInterval2(250, (/* @__PURE__ */ new Date()).valueOf())) {
        const elapsed = (/* @__PURE__ */ new Date()).valueOf() - start;
        if (elapsed > timeout) {
          if (lastResult) {
            resolve(lastResult);
            return;
          }
          reject(new Error("time out executing step"));
          return;
        }
        const res = await cb();
        if (res) {
          if (res.result === "pass") {
            resolve(res);
            return;
          }
          lastResult = res;
        }
      }
    })();
  });
}
async function findElement(ctx, identifierType, identifier, timeout) {
  return new Promise((resolve, reject) => {
    ;
    (async () => {
      for await (const start of setInterval2(100, (/* @__PURE__ */ new Date()).valueOf())) {
        const elapsed = (/* @__PURE__ */ new Date()).valueOf() - start;
        if (elapsed > timeout) {
          reject(new Error(`time out search for element: ${identifierType}=${identifier}`));
          break;
        }
        let el = null;
        let t = identifierType.toLowerCase();
        if (/^aria[- _]/.test(t)) {
          t = "aria";
        }
        try {
          switch (t) {
            case "id":
              el = await ctx.browser.findElement(By.id(identifier));
              break;
            case "class":
              el = await ctx.browser.findElement(By.className(identifier));
              break;
            case "css selector":
            case "css":
              el = await ctx.browser.findElement(By.css(identifier));
              break;
            case "field":
              el = await ctx.browser.findElement(By.name(identifier));
              break;
            case "label":
              el = await findByLabel(ctx, identifierType, identifier);
              break;
            case "name":
              el = await ctx.browser.findElement(By.css(`*[name='${identifier}']`));
              break;
            case "text":
              el = await ctx.browser.findElement(By.xpath(`//*[text()='${identifier}']`));
              break;
            case "button":
              el = await ctx.browser.findElement(By.xpath(`//button[text()='${identifier}']`));
              break;
            case "aria":
              el = await ctx.browser.findElement(
                By.css(`*[${identifierType.toLowerCase().replaceAll(/[ _]/g, "-")}='${identifier}']`)
              );
              break;
            default:
              throw new Error(`unknown identifier type: ${identifierType}`);
          }
        } catch (e) {
          if (e instanceof error.NoSuchElementError || e instanceof error.StaleElementReferenceError) {
            continue;
          }
          reject(e);
          return;
        }
        if (!el) {
          continue;
        }
        resolve(el);
      }
    })();
  });
}
async function findByLabel(ctx, identifierType, identifier) {
  const el = await ctx.browser.findElement(By.xpath(`//*[contains(text(),'${identifier}')]`));
  if (!el) {
    return null;
  }
  const forAttr = await el.getAttribute("for");
  if (forAttr) {
    return await ctx.browser.findElement(By.id(forAttr));
  }
  return el;
}
async function checkForClass(el, clazz) {
  const classes = await el.getAttribute("class");
  if (!classes) {
    return false;
  }
  const list = classes.toString().split(" ");
  return list.indexOf(clazz) >= 0;
}
function formatNumber(val) {
  let result = val.toString();
  while (result.length < 5) {
    result = " " + result;
  }
  return result;
}
function outcomeStart(name) {
  const startDate = /* @__PURE__ */ new Date();
  return {
    executionId: createId(),
    name: name || `Test run: ${format(startDate, "yyyy-MM-dd HH:mm:ss")}`,
    result: "fail",
    startDate,
    duration: 0,
    passCount: 0,
    failCount: 0,
    skipCount: 0,
    warnCount: 0,
    errorCount: 0
  };
}
function outcomeEnd(outcome, result, message) {
  outcome.result = result;
  switch (result) {
    case "pass":
      outcome.passCount++;
      break;
    case "fail":
      outcome.failCount++;
      break;
    case "skip":
      outcome.skipCount++;
      break;
    case "warn":
      outcome.warnCount++;
      break;
    case "error":
      outcome.errorCount++;
      break;
  }
  outcome.message = message;
  outcome.endDate = /* @__PURE__ */ new Date();
  outcome.duration = outcome.endDate.getTime() - outcome.startDate.getTime();
  return outcome;
}
function aggregateOutcome(outcome, outcomes) {
  outcome.endDate = /* @__PURE__ */ new Date();
  outcome.duration = outcome.endDate.getTime() - outcome.startDate.getTime();
  for (const o of outcomes) {
    outcome.passCount += o.passCount;
    outcome.failCount += o.failCount;
    outcome.skipCount += o.skipCount;
    outcome.warnCount += o.warnCount;
    outcome.errorCount += o.errorCount;
  }
  if (outcome.errorCount > 0) {
    outcome.result = "error";
  } else if (outcome.failCount > 0) {
    outcome.result = "fail";
  } else if (outcome.passCount == 0 && outcome.warnCount > 0) {
    outcome.result = "warn";
  } else if (outcome.passCount == 0 && outcome.skipCount > 0) {
    outcome.result = "skip";
  } else {
    outcome.result = "pass";
  }
  return outcome;
}
async function uploadTestResult(cfg, testRun) {
  if (!cfg.uploadResults) {
    return;
  }
  const { status } = await axios2.post(`${cfg.apiBaseURL}/projects/${cfg.projectId}/results`, testRun, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${cfg.apiKey}`
    }
  });
  if (status !== 200) {
    throw `Server returned ${status}`;
  }
  console.log(chalk5.yellow(`\u{1F44D} Uploaded results to Testabulous`));
}

// src/runner/calls.ts
var testRunnerCalls = /* @__PURE__ */ new Map();
function getTestRunnerCall(name) {
  if (!testRunnerCalls.has(name)) {
    throw new Error(`test runner call not found: ${name}`);
  }
  return testRunnerCalls.get(name);
}
var validPageProperties = /* @__PURE__ */ new Set();
validPageProperties.add("title");
testRunnerCalls.set("navigate_to_page", async (ctx, args) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  if (!args.url) {
    throw new Error(`missing argument: url`);
  }
  try {
    const currentUrl = ctx.browser.getCurrentUrl();
    if (currentUrl === args.url) {
      await ctx.browser.navigate().refresh();
    } else {
      await ctx.browser.get(args.url);
    }
    for await (const start of setInterval3(1e3, (/* @__PURE__ */ new Date()).valueOf())) {
      const elapsed = (/* @__PURE__ */ new Date()).valueOf() - start;
      if (elapsed > ctx.timeout) {
        throw new Error("time out waiting for navigation");
      }
      const state = await ctx.browser.executeScript(`return document.readyState`);
      if (state === "complete" || state === "interactive") {
        break;
      }
    }
    await ctx.browser.executeScript(`window.TESTABULOUS_testRunId = "${ctx.testRunId}"`);
    outcomeEnd(res, "pass");
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("check_for_page_to_have_property", async (ctx, args) => {
  if (!args.property) {
    throw new Error(`missing argument: property`);
  }
  if (!args.value) {
    throw new Error(`missing argument: value`);
  }
  const property = args.property.toString().toLowerCase();
  if (!validPageProperties.has(property)) {
    throw new Error(`unsupported identifier: ${property}`);
  }
  const res = await executeWithTimeout(async () => {
    const res2 = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
    try {
      const state = await ctx.browser.executeScript(`return document.readyState`);
      if (state !== "complete") {
        return void 0;
      }
      const value = await ctx.browser.executeScript(`return document.${property}`);
      if (value == args.value) {
        outcomeEnd(res2, "pass");
      } else {
        outcomeEnd(res2, "fail", `found='${value}', expected='${args.value}'`);
      }
      res2.endDate = /* @__PURE__ */ new Date();
      res2.duration = res2.endDate.valueOf() - res2.startDate.valueOf();
      return res2;
    } catch (e) {
      console.log(chalk6.redBright(`\u{1F915} ${e}`));
      res2.result = "error";
      res2.message = e.toString();
    }
  }, ctx.timeout);
  return res;
});
testRunnerCalls.set("click_on_element", async (ctx, args) => {
  if (!args.identifier) {
    throw new Error(`missing argument: identifier`);
  }
  if (!args.identifierType) {
    throw new Error(`missing argument: identifierType`);
  }
  const res = await executeWithTimeout(async () => {
    const res2 = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
    try {
      const el = await findElement(ctx, args.identifierType, args.identifier, ctx.timeout);
      if (!el) {
        outcomeEnd(res2, "error", "element not found");
        return res2;
      }
      await el.click();
      outcomeEnd(res2, "pass");
      return res2;
    } catch (e) {
      console.log(chalk6.redBright(`\u{1F915} ${e}`));
      outcomeEnd(res2, "error", e.toString());
    }
  }, ctx.timeout);
  return res;
});
testRunnerCalls.set("enter_text_in_element", async (ctx, args) => {
  if (!args.identifier) {
    throw new Error(`missing argument: identifier`);
  }
  if (!args.identifierType) {
    throw new Error(`missing argument: identifierType`);
  }
  const res = await executeWithTimeout(async () => {
    const res2 = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
    try {
      const el = await findElement(ctx, args.identifierType, args.identifier, ctx.timeout);
      if (!el) {
        return;
      }
      await el.sendKeys(dereferenceArgument(ctx, args.data));
      outcomeEnd(res2, "pass");
      return res2;
    } catch (e) {
      console.log(chalk6.redBright(`\u{1F915} ${e}`));
      outcomeEnd(res2, "error", e.toString());
    }
  }, ctx.timeout);
  return res;
});
async function checkForState(ctx, args, expected) {
  if (!args.identifier) {
    throw new Error(`missing argument: identifier`);
  }
  if (!args.identifierType) {
    throw new Error(`missing argument: identifierType`);
  }
  if (!args.state) {
    throw new Error(`missing argument: state`);
  }
  if (!args.stateType) {
    throw new Error(`missing argument: stateType`);
  }
  const res = await executeWithTimeout(async () => {
    const res2 = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
    try {
      const el = await findElement(ctx, args.identifierType, args.identifier, ctx.timeout);
      if (!el) {
        return;
      }
      let hasState = false;
      switch (args.stateType) {
        case "class":
          hasState = await checkForClass(el, args.state);
          break;
        default:
          throw new Error("unknown state type");
      }
      if (hasState === expected) {
        outcomeEnd(res2, "pass");
      } else {
        outcomeEnd(res2, "fail", `unexpected state: found='${hasState}', expected='${expected}'`);
      }
      return res2;
    } catch (e) {
      console.log(chalk6.redBright(`\u{1F915} ${e}`));
      outcomeEnd(res2, "error", e.toString());
    }
  }, ctx.timeout);
  return res;
}
testRunnerCalls.set("element_has_property_or_state", async (ctx, args) => {
  return checkForState(ctx, args, true);
});
testRunnerCalls.set("element_does_not_have_property_or_state", async (ctx, args) => {
  return checkForState(ctx, args, false);
});
testRunnerCalls.set("element_has_text", async (ctx, args) => {
  if (!args.identifier) {
    throw new Error(`missing argument: identifier`);
  }
  if (!args.identifierType) {
    throw new Error(`missing argument: identifierType`);
  }
  if (!args.text) {
    throw new Error(`missing argument: text`);
  }
  const res = await executeWithTimeout(async () => {
    const res2 = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
    try {
      const el = await findElement(ctx, args.identifierType, args.identifier, ctx.timeout);
      if (!el) {
        return;
      }
      const text2 = await el.getText();
      if (text2 === args.text) {
        outcomeEnd(res2, "pass");
      } else {
        outcomeEnd(res2, "fail", `invalid text: found='${text2}', expected='${args.text}'`);
      }
      return res2;
    } catch (e) {
      console.log(chalk6.redBright(`\u{1F915} ${e}`));
      outcomeEnd(res2, "error", e.toString());
    }
  }, ctx.timeout);
  return res;
});
testRunnerCalls.set("wait_for_time_period", async (ctx, args) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  try {
    let time = parseInt(args.time);
    switch (args.unit) {
      case "s":
      case "second":
      case "seconds":
        time = time * 1e3;
        break;
      case "m":
      case "minute":
      case "minutes":
        time = time * 1e3 * 60;
        break;
      case "h":
      case "hour":
      case "hours":
        time = time * 1e3 * 60 * 60;
        break;
      default:
        throw new Error(`unsupported time unit: ${args.unit}`);
    }
    await new Promise((resolve) => setTimeout(resolve, time));
    outcomeEnd(res, "pass");
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("store_value_in_variable", async (ctx, args) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  if (!args.variableName) {
    throw new Error(`missing argument: variableName`);
  }
  try {
    ctx.metadata[args.variableName] = dereferenceArgument(ctx, args.value);
    outcomeEnd(res, "pass");
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("check_url_path", async (ctx, args) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  try {
    const urlRaw = await ctx.browser.getCurrentUrl();
    const url = new URL(urlRaw);
    if (url.pathname === args.path) {
      outcomeEnd(res, "pass");
    } else {
      outcomeEnd(res, "fail", `invalid url path: found='${url.pathname}', expected='${args.path}'`);
    }
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("wait_for_element_to_have_value", async (ctx) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  outcomeEnd(res, "error", "not implemented");
  return res;
});
testRunnerCalls.set("load_value_from_environment_variable", async (ctx, args) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  if (!args.variableName) {
    throw new Error(`missing argument: variableName`);
  }
  if (!args.envVarName) {
    throw new Error(`missing argument: envVariableName`);
  }
  try {
    const envVarName = args.envVarName.startsWith("$") ? args.envVarName.slice(1) : args.envVarName;
    const value = process.env[envVarName] || "";
    ctx.metadata[args.variableName] = dereferenceArgument(ctx, value);
    outcomeEnd(res, "pass");
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("execute_script", async (ctx, args) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  if (!args.scriptName) {
    throw new Error(`missing argument: variableName`);
  }
  const def = ctx.config.procedures.find((p) => p.name === args.scriptName);
  if (def) {
    const testResult = await runTest(def, ctx);
    outcomeEnd(res, testResult.result, testResult.message);
    return res;
  }
  const scriptPath = path5.join(ctx.config.scriptsDir, args.scriptName);
  if (!fileExists(scriptPath)) {
    throw new Error(`missing script: ${scriptPath}`);
  }
  try {
    const { default: scriptModule } = await import(scriptPath);
    const state = await scriptModule(ctx);
    outcomeEnd(res, state.result, state.message);
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("wait_for_navigation", async (ctx) => {
  const res = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
  try {
    for await (const start of setInterval3(1e3, (/* @__PURE__ */ new Date()).valueOf())) {
      const elapsed = (/* @__PURE__ */ new Date()).valueOf() - start;
      if (elapsed > ctx.timeout) {
        outcomeEnd(res, "fail", "timed out waiting for navigation");
        return res;
      }
      const readyState = await ctx.browser.executeScript(`return document.readyState`);
      if (!(readyState === "complete" || readyState === "interactive")) {
        continue;
      }
      const state = await ctx.browser.executeScript(`return window.TESTABULOUS_testRunId`);
      if (!state) {
        break;
      }
    }
    await ctx.browser.executeScript(`window.TESTABULOUS_testRunId = "${ctx.testRunId}"`);
    outcomeEnd(res, "pass");
  } catch (e) {
    console.log(chalk6.redBright(`\u{1F915} ${e}`));
    outcomeEnd(res, "error", e.toString());
  }
  return res;
});
testRunnerCalls.set("check_if_element_is_empty", async (ctx, args) => {
  if (!args.identifier) {
    throw new Error(`missing argument: identifier`);
  }
  if (!args.identifierType) {
    throw new Error(`missing argument: identifierType`);
  }
  const res = await executeWithTimeout(async () => {
    const res2 = { ...outcomeStart(ctx.currentStep.clause), stepId: ctx.currentStep.id };
    try {
      const el = await findElement(ctx, args.identifierType, args.identifier, ctx.timeout);
      if (!el) {
        return;
      }
      const children = await el.findElements({ css: "*" });
      if (children.length === 0) {
        outcomeEnd(res2, "pass");
      } else {
        outcomeEnd(res2, "fail", `element not empty: found=${children.length} children`);
      }
      return res2;
    } catch (e) {
      console.log(chalk6.redBright(`\u{1F915} ${e}`));
      outcomeEnd(res2, "error", e.toString());
    }
  }, ctx.timeout);
  return res;
});

// src/runner/browser.ts
import "chromedriver";
import { Builder, logging } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome.js";
import chalk7 from "chalk";
var browser = null;
async function createBrowser(cfg) {
  if (browser) {
    return browser;
  }
  console.log(chalk7.greenBright(`\u23F3 Starting web driver`));
  const browserType = cfg.browser?.browser ?? BrowserTypeEnum.Values.chrome;
  const size = {
    width: cfg.browser?.windowSize?.width ?? 1920,
    height: cfg.browser?.windowSize?.height ?? 1080
  };
  const headless = cfg.browser?.headless ?? false;
  const disableGpu = cfg.browser?.headless ?? false;
  const loggingPrefs = new logging.Preferences();
  loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  let chromeOptions = new chrome.Options();
  if (headless) {
    chromeOptions = chromeOptions.addArguments("--headless=new");
  }
  if (disableGpu) {
    chromeOptions = chromeOptions.addArguments("--disable-gpu");
  }
  chromeOptions = chromeOptions.addArguments("--no-sandbox");
  chromeOptions = chromeOptions.addArguments("--disable-dev-shm-usage");
  chromeOptions = chromeOptions.windowSize(size).setLoggingPrefs(loggingPrefs);
  console.log(chalk7.blue(`Staring browser: ${browser}`));
  console.log(chalk7.blue(`Screen size: ${size.width}x${size.height}`));
  console.log(chalk7.blue(`Headless: ${headless}`));
  browser = new Builder().forBrowser(browserType).setChromeOptions(chromeOptions).build();
  return browser;
}
async function closeBrowser() {
  if (browser) {
    await browser.quit();
  }
  browser = null;
}

// src/runner/index.ts
import { logging as logging2 } from "selenium-webdriver";
import { format as format2 } from "date-fns";

// src/runner/log.ts
import fs4 from "fs";
import path6 from "path";
import Handlebars from "handlebars";
var icons = {
  pass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
    <path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
  </svg>`,
  fail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
  </svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
    <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
  </svg>`,
  warn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
    <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
  </svg>`,
  skip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
    <path fill-rule="evenodd" d="M3.5 9.75A2.75 2.75 0 0 1 6.25 7h5.19L9.22 9.22a.75.75 0 1 0 1.06 1.06l3.5-3.5a.75.75 0 0 0 0-1.06l-3.5-3.5a.75.75 0 1 0-1.06 1.06l2.22 2.22H6.25a4.25 4.25 0 0 0 0 8.5h1a.75.75 0 0 0 0-1.5h-1A2.75 2.75 0 0 1 3.5 9.75Z" clip-rule="evenodd" />
  </svg>`
};
Handlebars.registerHelper("isPassed", function(value) {
  return value.result === "pass";
});
Handlebars.registerHelper("isFailed", function(value) {
  return value.result === "fail" || value.result === "error" || value.result === "warn";
});
Handlebars.registerHelper("isOthered", function(value) {
  return !(value.result === "pass" || value.result === "fail" || value.result === "error" || value.result === "warn");
});
Handlebars.registerHelper("renderName", function(test) {
  const icon = icons[test.result];
  let colour = "text-blue-700";
  switch (test.result) {
    case "pass":
      colour = "text-green-700";
      break;
    case "fail":
      colour = "text-red-700";
      break;
    case "error":
      colour = "text-red-700";
      break;
    case "warn":
      colour = "text-yellow-700";
      break;
  }
  return `<div class="flex flex-row gap-2 ${colour} items-center"><div>${icon}</div><div class="">${test.name}</div></div>`;
});
var templateMarkup = fs4.readFileSync(path6.resolve(__dirname, "../resources/testrun.hbs"), "utf8");
var template = Handlebars.compile(templateMarkup);
function renderTestResult(testRun) {
  return template({
    res: testRun,
    testCount: testRun.passCount + testRun.failCount + testRun.errorCount + testRun.warnCount + testRun.skipCount
  });
}

// src/runner/index.ts
import axios3 from "axios";
async function TestRunner(runType, cfg) {
  const run = { ...outcomeStart(), projectId: cfg.projectId, runType, specs: [] };
  console.log(chalk8.blueBright(`\u{1F680} Starting test run (id:${run.executionId})`));
  try {
    if (cfg.screenshots) {
      fs5.mkdir(`${cfg.screenshotsDir}/${run.executionId}`, { recursive: true });
    }
    switch (runType) {
      case "local":
        await runLocal(run, cfg);
        break;
      case "remote":
        await runRemote(run, cfg);
        break;
    }
    const res = aggregateOutcome(run, run.specs);
    let fn = null;
    switch (res.result) {
      case "pass":
      case "skip":
        fn = chalk8.greenBright;
        break;
      case "warn":
        fn = chalk8.yellowBright;
        break;
      case "fail":
      case "error":
        fn = chalk8.redBright;
        break;
    }
    await fs5.writeFile(
      `${cfg.logsDir}/${format2(run.startDate, "yyyyMMddHHmmss")}_${run.executionId}.json`,
      JSON.stringify(run, null, 2)
    );
    await fs5.writeFile(
      `${cfg.logsDir}/${format2(run.startDate, "yyyyMMddHHmmss")}_${run.executionId}.html`,
      renderTestResult(run)
    );
    await uploadTestResult(cfg, run);
    console.log(fn(`\u{1F4A5} Test run complete: ${res.result}`));
    console.log(fn(`  ${formatNumber(res.passCount)} passed`));
    console.log(fn(`  ${formatNumber(res.failCount)} failed`));
    console.log(fn(`  ${formatNumber(res.skipCount)} skipped`));
    console.log(fn(`  ${formatNumber(res.warnCount)} warnings`));
    console.log(fn(`  ${formatNumber(res.errorCount)} errors`));
    return res;
  } catch (e) {
    console.log(chalk8.redBright(`\u{1F915} Exception running tests: ${e}`));
    throw e;
  } finally {
    closeDatabase();
  }
}
async function runLocal(run, cfg) {
  const db = getDatabase(cfg.cacheDir);
  const testFiles = await getTargetFiles(cfg);
  await cacheFiles(testFiles, cfg, db);
  const specs = [];
  for (const f of testFiles) {
    const spec = await findTestSpec(f, db);
    specs.push(spec);
    for (const d of spec.definitions) {
      if (d.type === 1 /* Procedure */) {
        cfg.procedures.push(d);
      }
    }
  }
  for (const spec of specs) {
    let countOfTests = 0;
    for (const d of spec.definitions) {
      if (d.type === 0 /* Test */) {
        countOfTests++;
      }
    }
    if (countOfTests === 0) {
      continue;
    }
    const browser2 = await createBrowser(cfg);
    const ctx = {
      testRunId: run.executionId,
      config: cfg,
      browser: browser2,
      metadata: {},
      timeout: 1e4
    };
    const specResult = await runSpecTests(spec, ctx);
    run.specs.push(specResult);
  }
}
async function runRemote(run, cfg) {
  try {
    if (cfg.taskId) {
      run.taskId = cfg.taskId;
    }
    const { status, data: scripts } = await axios3.get(
      `${cfg.apiBaseURL}/projects/${cfg.projectId}/scripts`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${cfg.apiKey}`
        }
      }
    );
    if (status !== 200) {
      throw `Server returned ${status}`;
    }
    for (const s of scripts) {
      if (cfg.testScriptDataId && s.scriptData.id !== cfg.testScriptDataId) {
        continue;
      }
      const specResult = await runRemoteScript(s, cfg, run.executionId);
      run.specs.push(specResult);
    }
  } catch (e) {
    console.log(chalk8.redBright(`\u{1F915} Running scripts for project ${cfg.projectId}: ${e}`));
    throw e;
  }
}
async function findTestSpec(file, db) {
  console.log(chalk8.whiteBright(`Loading file: ${file}`));
  const data = await fs5.readFile(file, { encoding: "utf-8" });
  const hash = createHash2("sha256").update(data).digest("base64");
  const existingScript = await findScriptDataByHash(hash, db);
  if (!existingScript) {
    throw "Script not found";
  }
  const spec = await findTestSpecByScriptDataId(existingScript.id, db);
  if (!spec) {
    throw "Test spec not found";
  }
  if (spec.definitions.length === 0) {
    throw "No tests found";
  }
  return spec;
}
async function runSpecTests(spec, ctx) {
  if (spec.name) {
    console.log(chalk8.whiteBright(spec.name));
    console.log(chalk8.whiteBright("=".repeat(spec.name.length)));
  }
  try {
    const specResult = { ...outcomeStart(spec.name), specId: spec.id, tests: [] };
    for (const d of spec.definitions) {
      if (d.type !== 0 /* Test */) {
        continue;
      }
      if (!ctx.config.test || d.name === ctx.config.test) {
        const testResult = await runTest(d, ctx);
        specResult.tests.push(testResult);
      }
    }
    return aggregateOutcome(specResult, specResult.tests);
  } catch (e) {
    console.log(chalk8.redBright(`\u{1F915} Processing ${spec.name}: ${e}`));
    throw e;
  } finally {
    try {
      console.info(chalk8.blueBright(`\u{1F44D} Closing browser`));
      await closeBrowser();
    } catch (e) {
      console.warn(chalk8.yellow(`\u{1F915} Closing browser: ${e}`));
    }
  }
}
async function runRemoteScript(testScript, cfg, testRunId) {
  const spec = testScript.scriptData.spec;
  if (!spec) {
    throw "No spec found";
  }
  console.log(chalk8.blueBright(`Running ${spec.name} (${spec.id})`));
  const browser2 = await createBrowser(cfg);
  const ctx = {
    testRunId,
    config: cfg,
    browser: browser2,
    metadata: {},
    timeout: 1e4
  };
  try {
    const specResult = { ...outcomeStart(spec.name), specId: spec.id, tests: [] };
    for (const d of spec.definitions) {
      if (!cfg.test || d.name === cfg.test) {
        const testResult = await runTest(d, ctx);
        specResult.tests.push(testResult);
      }
    }
    return aggregateOutcome(specResult, specResult.tests);
  } catch (e) {
    console.log(chalk8.redBright(`\u{1F915} Processing ${spec.name} (${spec.id}): ${e}`));
    throw e;
  } finally {
    try {
      console.info(chalk8.blueBright(`\u{1F44D} Closing browser`));
      await closeBrowser();
    } catch (e) {
      console.warn(chalk8.yellow(`\u{1F915} Closing browser: ${e}`));
    }
  }
}
async function runTest(def, ctx) {
  console.log(chalk8.whiteBright(`  ${def.name}`));
  console.log(chalk8.whiteBright(`  ${"=".repeat(def.name.length)}`));
  const testResult = { ...outcomeStart(def.name), definitionId: def.id, steps: [] };
  const calls = /* @__PURE__ */ new Map();
  for (const c of def.calls) {
    if (!calls.has(c.testSpecClauseId)) {
      calls.set(c.testSpecClauseId, []);
    }
    calls.get(c.testSpecClauseId)?.push(c);
  }
  for (const step of def.steps) {
    console.log(chalk8.whiteBright(`  * ${step.clause} (L${step.line + 1})`));
    if (!calls.has(step.id)) {
      console.log(chalk8.redBright(`    (\u2717) No function calls for ${step.clause}`));
      const res = { ...outcomeStart(step.clause), stepId: step.id };
      testResult.steps.push(outcomeEnd(res, "error", "no matching calls found for step"));
      continue;
    }
    const callList = calls.get(step.id);
    if (!callList || callList.length == 0) {
      const res = { ...outcomeStart(step.clause), stepId: step.id };
      testResult.steps.push(outcomeEnd(res, "error", "no function calls found for step"));
      continue;
    }
    ctx.currentStep = step;
    for (const c of callList) {
      const fn = getTestRunnerCall(c.call);
      try {
        const params = JSON.parse(c.params);
        const result = await fn(ctx, params);
        testResult.steps.push(result);
        if (ctx.config.screenshots) {
          result.screenshot = `${ctx.config.screenshotsDir}/${ctx.testRunId}/${step.id}_${result.executionId}.png`;
          const data = await ctx.browser.takeScreenshot();
          await fs5.writeFile(result.screenshot, data, "base64");
        }
        if (result.result === "pass") {
          console.log(chalk8.greenBright(`    (\u2713) Passed`));
        } else if (result.result === "warn") {
          console.log(chalk8.yellowBright(`    (\u26A0) Warning: ${result.message}`));
        } else {
          console.log(chalk8.redBright(`    (\u2717) Failed: ${result.message}`));
        }
      } catch (e) {
        console.log(chalk8.redBright(`    (\u2717) Error: ${e}`));
        const browserLogs = await ctx.browser.manage().logs().get(logging2.Type.BROWSER);
        for (const log of browserLogs) {
          console.log(chalk8.yellowBright(`    (\u2717) ${log.message}`));
        }
      }
    }
  }
  return aggregateOutcome(testResult, testResult.steps);
}

// src/ui/index.ts
async function WebUI(cfg) {
  throw new Error("WebUI: not implemented (yet)");
}

// src/init/index.ts
import axios4 from "axios";
import inquirer from "inquirer";
import { promises as fs6 } from "fs";
import chalk9 from "chalk";
async function InitTestabulous(cfg) {
  const questions = [
    {
      type: "input",
      name: "projectId",
      message: "Project ID (copied from dashboard)",
      default: cfg.projectId
    },
    {
      type: "input",
      name: "apiKey",
      message: "Project API key (copied from dashboard)",
      default: cfg.apiKey
    }
  ];
  const answers = await inquirer.prompt(questions);
  if (!answers.projectId || !answers.apiKey) {
    throw new Error("Project ID and API key are required");
  }
  cfg.projectId = answers.projectId;
  cfg.apiKey = answers.apiKey;
  try {
    const { data } = await axios4.post(`${cfg.apiBaseURL}/projects/${cfg.projectId}/ping`, void 0, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      }
    });
    if (data !== "pong") {
      throw new Error("Project ID or API key is invalid");
    }
    const envFileContent = `TESTABULOUS_PROJECT_ID=${cfg.projectId}
TESTABULOUS_API_KEY=${cfg.apiKey}
`;
    await fs6.writeFile(".env.testabulous", envFileContent, { encoding: "utf-8" });
    const configFileContent = JSON.stringify({ envFile: ".env.testabulous" }, null, 2);
    await fs6.writeFile("testabulous.config.json", configFileContent, { encoding: "utf-8" });
    const packageJson = await fs6.readFile("package.json", { encoding: "utf-8" });
    const packageJsonObj = JSON.parse(packageJson);
    if (!packageJsonObj.scripts) {
      packageJsonObj.scripts = {};
    }
    if (!packageJsonObj.scripts["testabulous:cache"]) {
      packageJsonObj.scripts["test:cache"] = "testabulous cache --force";
    }
    if (!packageJsonObj.scripts["testabulous:test"]) {
      packageJsonObj.scripts["test"] = "testabulous test";
    }
    if (!packageJsonObj.scripts["testabulous:help"]) {
      packageJsonObj.scripts["test:help"] = "testabulous --help";
    }
    await fs6.writeFile("package.json", JSON.stringify(packageJsonObj, null, 2), { encoding: "utf-8" });
    console.log(
      chalk9.greenBright(
        "Your project ID and API key have been saved to .env.testabulous and this file referenced in testabulous.config.json. You should make sure that .env.testabulous is added to your .gitignore file. Alternatively, you can merge the TESTABULOUS_PROJECT_ID and TESTABULOUS_API_KEY environment variables into another .env file and update the config file accordingly, or set them elsewhere.\nYou can now start creating your test files in ./testabulous/tests and call 'npm run test' to run your tests. See https://docs.testabulous.com/category/getting-started for more information."
      )
    );
  } catch (e) {
    console.log(e);
    if (axios4.isAxiosError(e)) {
      if (e.response && (e.response.status === 404 || e.response.status === 401)) {
        throw new Error("Project ID or API key is invalid");
      }
    }
    throw e;
  }
  console.log(chalk9.greenBright("\u{1F44D} Project initialised"));
}

// src/index.ts
console.log(chalk10.greenBright(figlet.textSync("Testabulous")));
var program = new Command();
program.exitOverride((err) => {
  console.log(chalk10.redBright(`\u{1F915} ${err}`));
  process.exit(-1);
});
program.version("1.0.0").description("Testabulous E2E Testing Framework").option("-c, --config-file <value>", "Local config file [./testabulous.config.json]").option("-e, --env-file <value>", "File to load environment variables from").option("-p, --project-id <value>", "Project ID").option("-k, --api-key <value>", "API key").option("-r, --root-dir <value>", "Test root directory [./testabulous]");
program.command("init").description("Initialise testabulous project").action(async () => {
  try {
    const cfg = await BuildConfig(program.opts(), {});
    await migrateDatabase(cfg.cacheDir);
    await InitTestabulous(cfg);
  } catch (e) {
    console.log(chalk10.redBright(`\u{1F915} Initialisation failed: ${e}`));
    process.exit(-1);
  }
});
program.command("cache").option("-f, --file <value>", "Specific test file to cache").option("-F, --force", "Force re-cache of all test files").description("Parse and cache test files").action(async (localOpts) => {
  try {
    let cfg;
    try {
      cfg = await BuildConfig(program.opts(), localOpts);
      await migrateDatabase(cfg.cacheDir);
    } catch (e) {
      console.log(chalk10.redBright(`\u{1F915} Initialisation failed: ${e}`));
      process.exit(-1);
    }
    await Cache(cfg);
  } catch (e) {
    console.log(chalk10.redBright(`\u{1F915} ${e}`));
    process.exit(-1);
  }
});
program.command("test").option("-f, --file <value>", "Specific test file to execute").option("-t, --test <value>", "Specific test to execute").description("Start testabulous test runner").action(async (localOpts) => {
  let cfg;
  try {
    cfg = await BuildConfig(program.opts(), localOpts);
    await migrateDatabase(cfg.cacheDir);
  } catch (e) {
    console.log(chalk10.redBright(`\u{1F915} Initialisation failed: ${e}`));
    process.exit(-1);
  }
  TestRunner("local", cfg).then((results) => {
    switch (results.result) {
      case "pass":
      case "skip":
        process.exit(0);
        break;
      case "warn":
        process.exit(1);
        break;
      case "fail":
        process.exit(2);
        break;
      case "error":
        process.exit(3);
        break;
    }
  }).catch(() => {
    process.exit(3);
  });
});
program.command("remote").description("Start testabulous test runner for remote run").action(async (localOpts) => {
  let cfg;
  try {
    cfg = await BuildConfig(program.opts(), localOpts);
    await migrateDatabase(cfg.cacheDir);
  } catch (e) {
    console.log(chalk10.redBright(`\u{1F915} Initialisation failed: ${e}`));
    process.exit(-1);
  }
  TestRunner("remote", cfg).then((results) => {
    switch (results.result) {
      case "pass":
      case "skip":
        process.exit(0);
        break;
      case "warn":
        process.exit(1);
        break;
      case "fail":
        process.exit(2);
        break;
      case "error":
        process.exit(3);
        break;
    }
  }).catch(() => {
    process.exit(3);
  });
});
program.command("open").description("Open testabulous UI").option("-P, --port <value>", "Port to run Testabulous UI [4001]").action(async (localOpts) => {
  let cfg;
  try {
    cfg = await BuildConfig(program.opts(), localOpts);
    await migrateDatabase(cfg.cacheDir);
  } catch (e) {
    console.log(chalk10.redBright(`\u{1F915} Initialisation failed: ${e}`));
    process.exit(-1);
  }
  WebUI(cfg).then(() => {
    console.log(chalk10.greenBright(`Lingobt UI terminated`));
  }).catch((e) => {
    console.log(chalk10.redBright(`\u{1F915} ${e}`));
    process.exit(-1);
  });
});
try {
  program.parse(process.argv);
} catch (e) {
  console.log(chalk10.redBright(`\u{1F915} ${e}`));
  process.exit(-1);
}
//# sourceMappingURL=index.js.map