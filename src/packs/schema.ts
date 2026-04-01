import { z } from "zod";

export const packSourceSchema = z.enum(["builtin", "local", "github"]);

export const manifestPackRefSchema = z
  .object({
    source: packSourceSchema,
    id: z.string().min(1),
    version: z.string().optional(),
    path: z.string().optional(),
  })
  .strict();

export const packManifestFragmentSchema = z
  .object({
    instructions: z
      .object({
        codingStyle: z.array(z.string()).optional(),
        reviewRules: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
    conventions: z
      .object({
        routing: z.string().optional(),
        folderStructure: z.string().optional(),
        accessibility: z.boolean().optional(),
        responsive: z.boolean().optional(),
        authModel: z.enum(["rbac", "none", "custom"]).optional(),
      })
      .strict()
      .optional(),
    generated: z
      .object({
        mcpPresets: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const packDefinitionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    version: z.string().min(1),
    manifest: packManifestFragmentSchema,
  })
  .strict();

export type PackSource = z.infer<typeof packSourceSchema>;
export type ManifestPackRef = z.infer<typeof manifestPackRefSchema>;
export type PackManifestFragment = z.infer<typeof packManifestFragmentSchema>;

export type PackDefinition = {
  id: string;
  name: string;
  description: string;
  version: string;
  source: PackSource;
  manifest: PackManifestFragment;
};
