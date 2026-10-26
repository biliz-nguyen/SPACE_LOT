import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import {
  Box,
  PackageOpen,
  Sparkles,
  Globe2,
  Upload,
  Download,
  FolderOpen,
  RotateCcw,
  Settings2,
  ChevronRight,
  PanelLeft,
  SlidersHorizontal,
  X,
  ShieldCheck,
  CloudOff,
} from "lucide-react";
import { PartsCatalog } from "@/components/PartsCatalog";
import { AssemblyViewport } from "@/components/AssemblyViewport";
import { InspectorPanel } from "@/components/InspectorPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  store,
  catalog,
  useProject,
  downloadJSON,
  type StudioTab,
} from "@/lib/project";
import { DroneScene } from "./scene.js";
import { setupStudio } from "./assets/studio.js";
import { setupManifest } from "./manifest.js";
import { cloud } from "./assets/cloud.js";
type Studio = ReturnType<typeof setupStudio>;
export default function App() {
  useProject();
  const model = useRef<DroneScene | null>(null),
    studio = useRef<Studio | null>(null),
    file = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState(""),
    [ready, setReady] = useState(false),
    [panel, setPanel] = useState<"parts" | "inspector" | null>(null),
    [resetOpen, setResetOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 4000);
  }, []);
  useEffect(() => {
    const container = document.getElementById("three-container")!;
    let scene: DroneScene | null = null;
    try {
      scene = new DroneScene(
        container,
        (id: string | null) => store.select(id),
        (id: string, pos: [number, number, number]) => store.move(id, pos),
      );
    } catch {
      document.getElementById("viewport-error")!.textContent =
        "3D preview unavailable. Enable WebGL or try a supported browser. Your project and tools remain available.";
    }
    model.current = scene;
    // Keep the initial studio composition clear; labels remain an explicit view option.
    store.showLabels = false;
    const update = () =>
      scene?.setData(store.project, catalog, {
        selectedId: store.selectedId,
        mode: store.mode,
        tool: store.tool,
        explode: store.explode,
        showLabels: store.showLabels,
        showClearance: store.showClearance,
        highlightedWire: store.highlightedWire,
      });
    const unsubscribe = store.subscribe(update);
    update();
    studio.current = setupStudio({
      store,
      catalog,
      model: scene || {
        dropPosition() {
          throw Error(
            "3D unavailable. Use Add in My Hangar to insert at the default position.",
          );
        },
      },
      toast: notify,
    });
    const manifest = setupManifest({ store, catalog });
    const assetError = (event: Event) =>
      notify((event as CustomEvent<string>).detail);
    container.addEventListener("asset-error", assetError);
    setReady(true);
    return () => {
      clearTimeout(timer.current);
      unsubscribe();
      container.removeEventListener("asset-error", assetError);
      studio.current?.destroy();
      manifest.destroy();
      scene?.dispose();
      model.current = null;
      studio.current = null;
    };
  }, [notify]);
  function open(tab: StudioTab) {
    studio.current?.open(tab);
  }
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !target.closest("input,textarea,select,[contenteditable]") &&
        !document.querySelector('dialog[open],[role="dialog"]')
      ) {
        event.preventDefault();
        setPanel("parts");
        document.getElementById("catalog-search")?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className="premium-shell">
        <a className="skip-link" href="#workspace-main">
          Skip to 3D workspace
        </a>
        <header className="app-header">
          <a className="brand" href="/" aria-label="SPACE_LOT home">
            <img src="/logo.svg" alt="" />
            <div>
              SPACE_LOT<span>AEROSPACE STUDIO</span>
            </div>
            <span className="premium-badge">v1</span>
          </a>
          <nav aria-label="Main navigation" className="main-nav">
            <button
              className="active"
              aria-label="Builder"
              aria-current="page"
              onClick={() => setPanel(null)}
            >
              <Box size={17} />
              <span>Builder</span>
            </button>
            <button
              id="open-hangar"
              aria-label="My Hangar"
              disabled={!ready}
              onClick={() => open("local")}
            >
              <PackageOpen size={17} />
              <span>My Hangar</span>
            </button>
            <button
              id="open-ai"
              aria-label="AI Workshop"
              disabled={!ready}
              onClick={() => open("ai")}
            >
              <Sparkles size={17} />
              <span>AI Workshop</span>
            </button>
            <button
              id="open-community"
              aria-label="Community"
              disabled={!ready}
              onClick={() => open("community")}
            >
              <Globe2 size={17} />
              <span>Community</span>
            </button>
          </nav>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Workspace settings"
              >
                <Settings2 />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <span className="eyebrow">WORKSPACE SETTINGS</span>
              <DialogTitle>Connection & storage</DialogTitle>
              <DialogDescription>
                Your local workspace is always available. Cloud services are
                optional.
              </DialogDescription>
              <div className="connection-card">
                {cloud ? <ShieldCheck /> : <CloudOff />}
                <div>
                  <strong>
                    {cloud ? "Cloud configuration found" : "Local workspace"}
                  </strong>
                  <p>
                    {cloud
                      ? "Sign in through Community to use cloud services. The connection has not been verified."
                      : "Import, assemble and export models on this browser. Connect Supabase in the project environment to enable Community and AI."}
                  </p>
                </div>
              </div>
              <p className="helper">
                GLB files stay in this browser until you explicitly contribute.
                Export a backup before clearing browser data. Provider
                credentials belong on the server.
              </p>
            </DialogContent>
          </Dialog>
        </header>
        <div className="project-bar">
          <div className="project-identity">
            <span className="project-icon">
              <Box size={18} />
            </span>
            <div>
              <span className="eyebrow">
                PERSONAL WORKSPACE <ChevronRight size={11} />
              </span>
              <input
                id="project-name"
                aria-label="Tên project"
                maxLength={72}
                value={store.project.projectName}
                onChange={(e) => {
                  store.project.projectName = e.target.value;
                  store.changed();
                }}
              />
            </div>
            <span className="local-badge">
              <span className="status-led" />
              Local project
            </span>
          </div>
          <div className="project-actions">
            <Button
              variant="ghost"
              size="sm"
              id="import-project-btn"
              title="Import assembly JSON"
              onClick={() => file.current?.click()}
            >
              <FolderOpen />
              <span>Open</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              id="reset-btn"
              aria-label="Reset demo assembly"
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw />
              <span>Reset</span>
            </Button>
            <span className="action-separator" />
            <Button
              variant="outline"
              size="sm"
              id="import-btn"
              disabled={!ready}
              onClick={() => open("import")}
            >
              <Upload />
              <span>Import model</span>
            </Button>
            <Button
              size="sm"
              id="export-btn"
              onClick={() => {
                downloadJSON("space-lot-assembly.json", store.project);
                notify("Đã xuất project JSON.");
              }}
            >
              <Download />
              <span>Export project</span>
            </Button>
            <input
              ref={file}
              hidden
              type="file"
              id="import-file"
              accept=".json,application/json"
              onChange={async (e) => {
                const input = e.currentTarget,
                  f = input.files?.[0];
                if (!f) return;
                try {
                  store.import(JSON.parse(await f.text()));
                  notify("Đã import project.");
                } catch (error) {
                  notify(
                    `Import failed: ${error instanceof Error ? error.message : "Invalid project"}`,
                  );
                }
                input.value = "";
              }}
            />
          </div>
        </div>
        <div className="mobile-panels">
          <Button
            variant={panel === "parts" ? "default" : "outline"}
            size="sm"
            aria-controls="parts-panel"
            aria-expanded={panel === "parts"}
            onClick={() => setPanel(panel === "parts" ? null : "parts")}
          >
            <PanelLeft />
            Parts catalog
          </Button>
          <Button
            variant={panel === "inspector" ? "default" : "outline"}
            size="sm"
            aria-controls="inspector-panel"
            aria-expanded={panel === "inspector"}
            onClick={() => setPanel(panel === "inspector" ? null : "inspector")}
          >
            <SlidersHorizontal />
            Inspector
          </Button>
        </div>
        <div className={`premium-workspace ${panel ? `show-${panel}` : ""}`}>
          <aside id="parts-panel" className="parts-panel">
            <button
              className="mobile-close"
              aria-label="Đóng parts catalog"
              onClick={() => setPanel(null)}
            >
              <X size={19} />
            </button>
            <PartsCatalog notify={notify} />
          </aside>
          <main id="workspace-main" className="workspace-main" tabIndex={-1}>
            <AssemblyViewport model={model} />
          </main>
          <aside id="inspector-panel" className="inspector-panel">
            <button
              className="mobile-close"
              aria-label="Đóng inspector"
              onClick={() => setPanel(null)}
            >
              <X size={19} />
            </button>
            <InspectorPanel notify={notify} openImport={() => open("import")} />
          </aside>
        </div>
        <footer className="app-footer">
          <span>
            <span className="status-led" />
            LOCAL FIRST<span className="footer-divider">/</span>CAD + MESH
            PIPELINE
          </span>
          <span>
            SPACE_LOT PREMIUM UI v1 <span className="footer-divider">·</span>{" "}
            ENGINEER YOUR NEXT HORIZON
          </span>
        </footer>
        {message ? (
          <motion.div
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="toast visible"
            id="toast"
            role="status"
            aria-live="polite"
          >
            {message}
          </motion.div>
        ) : null}
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent>
            <DialogTitle>Restore demo assembly?</DialogTitle>
            <DialogDescription>
              Các thay đổi chưa export sẽ bị mất. Model đã lưu trong My Hangar
              vẫn được giữ.
            </DialogDescription>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setResetOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  store.reset();
                  setResetOpen(false);
                  notify("Đã khôi phục project demo.");
                }}
              >
                Restore demo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MotionConfig>
  );
}
