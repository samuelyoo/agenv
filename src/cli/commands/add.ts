import { Command } from "commander";
import { loadManifest } from "../../manifest/load.js";
import { saveManifest } from "../../manifest/save.js";
import { getPackById, VALID_PACK_IDS } from "../../packs/catalog.js";
import { VALID_PRESET_IDS } from "../../mcp/presets.js";
import { InvalidOptionError } from "../../errors.js";

type AddOptions = {
  json?: boolean;
};

export function registerAddCommand(program: Command): void {
  const addCmd = program
    .command("add")
    .description("Add a pack or preset to the manifest.");

  addCmd
    .command("pack <id>")
    .description("Add a built-in pack to the manifest.")
    .option("--json", "Output JSON", false)
    .option("--list", "List available packs", false)
    .action(async (id: string, opts: AddOptions & { list?: boolean }) => {
      if (opts.list === true) {
        const packs = VALID_PACK_IDS;
        if (opts.json === true) {
          console.log(JSON.stringify(packs, null, 2));
        } else {
          console.log("Available packs:");
          for (const packId of packs) {
            const pack = getPackById(packId);
            console.log(`  ${packId} — ${pack?.description ?? ""}`);
          }
        }
        return;
      }

      const pack = getPackById(id);
      if (pack === undefined) {
        throw new InvalidOptionError("pack", id, VALID_PACK_IDS);
      }

      const cwd = process.cwd();
      const { manifest } = await loadManifest(cwd);

      const existingPacks = manifest.packs ?? [];
      const alreadyAdded = existingPacks.some((p) => p.id === id && p.source === "builtin");

      if (alreadyAdded) {
        if (opts.json === true) {
          console.log(JSON.stringify({ status: "already-added", pack: id }));
        } else {
          console.log(`Pack "${id}" is already in the manifest.`);
        }
        return;
      }

      manifest.packs = [...existingPacks, { source: "builtin", id }];
      await saveManifest(cwd, manifest);

      if (opts.json === true) {
        console.log(JSON.stringify({ status: "added", pack: id }));
      } else {
        console.log(`Added pack "${id}" to ai-workspace.json.`);
      }
    });

  addCmd
    .command("preset <id>")
    .description("Add an MCP preset to the manifest.")
    .option("--json", "Output JSON", false)
    .option("--list", "List available presets", false)
    .action(async (id: string, opts: AddOptions & { list?: boolean }) => {
      if (opts.list === true) {
        if (opts.json === true) {
          console.log(JSON.stringify(VALID_PRESET_IDS, null, 2));
        } else {
          console.log("Available presets:");
          for (const presetId of VALID_PRESET_IDS) {
            console.log(`  ${presetId}`);
          }
        }
        return;
      }

      if (!VALID_PRESET_IDS.includes(id)) {
        throw new InvalidOptionError("preset", id, VALID_PRESET_IDS);
      }

      const cwd = process.cwd();
      const { manifest } = await loadManifest(cwd);

      if (manifest.generated.mcpPresets.includes(id)) {
        if (opts.json === true) {
          console.log(JSON.stringify({ status: "already-added", preset: id }));
        } else {
          console.log(`Preset "${id}" is already in the manifest.`);
        }
        return;
      }

      manifest.generated.mcpPresets = [...manifest.generated.mcpPresets, id];
      await saveManifest(cwd, manifest);

      if (opts.json === true) {
        console.log(JSON.stringify({ status: "added", preset: id }));
      } else {
        console.log(`Added MCP preset "${id}" to ai-workspace.json.`);
      }
    });
}
