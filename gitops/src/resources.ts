import { parse as parseYaml } from "yaml";
import { readdir, readFile } from "fs/promises";
import { join, basename, extname } from "path";
import { existsSync } from "fs";
import { RESOURCES_DIR } from "./config.ts";
import type { ResourceFile, ResourceType } from "./types.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Resource Loading
// ─────────────────────────────────────────────────────────────────────────────

export async function loadResources<T>(
  type: ResourceType
): Promise<ResourceFile<T>[]> {
  const resourceDir = join(RESOURCES_DIR, type);

  if (!existsSync(resourceDir)) {
    console.log(`📁 No ${type} directory found, skipping...`);
    return [];
  }

  const files = await readdir(resourceDir);
  const resources: ResourceFile<T>[] = [];

  for (const file of files) {
    const ext = extname(file);
    if (ext !== ".yml" && ext !== ".yaml" && ext !== ".ts") continue;

    const filePath = join(resourceDir, file);
    const resourceId = basename(file, ext); // Use filename (without extension) as resourceId

    let data: T;
    if (ext === ".ts") {
      // Dynamic import for TypeScript files
      const module = await import(filePath);
      data = module.default as T;
    } else {
      // Parse YAML files
      const content = await readFile(filePath, "utf-8");
      data = parseYaml(content) as T;
    }

    resources.push({ resourceId, filePath, data });
    console.log(`  📦 Loaded ${type}/${resourceId}`);
  }

  return resources;
}

