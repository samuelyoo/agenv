import { authSession } from "./sessions/auth.js";
import { dataSession } from "./sessions/data.js";
import { outputSession } from "./sessions/output.js";
import { projectTypeSession } from "./sessions/project-type.js";
import { qualitySession } from "./sessions/quality.js";
import { setupDepthSession } from "./sessions/setup-depth.js";
import { stackSession } from "./sessions/stack.js";
import { toolsSession } from "./sessions/tools.js";
import { toolingSession } from "./sessions/tooling.js";
import { uiSession } from "./sessions/ui.js";

export const initFlowSessions = [
  toolsSession,
  projectTypeSession,
  setupDepthSession,
  stackSession,
  uiSession,
  dataSession,
  authSession,
  qualitySession,
  toolingSession,
  outputSession,
];
