import type { RefObject } from "react";
import {
  Box,
  GitBranch,
  House,
  Maximize2,
  MousePointer2,
  Move,
  Grid2X2,
  ScanLine,
  Layers,
  ArrowUpRight,
  Weight,
  Crosshair,
  Gauge,
  Clock3,
} from "lucide-react";
import { store, useProject, analyze, catalog, number } from "@/lib/project";
import { DroneScene } from "../scene.js";
import { Button } from "./ui/button";
export function AssemblyViewport({
  model,
}: {
  model: RefObject<DroneScene | null>;
}) {
  useProject();
  const data = analyze(store.project, catalog);
  function mode(value: string) {
    store.mode = value;
    if (value === "wiring") store.explode = 0;
    store.changed(false);
  }
  function tool(value: string) {
    store.tool = value;
    if (value === "move") store.explode = 0;
    store.changed(false);
  }
  const metrics = [
    {
      label: "Total mass",
      value: `${number(data.massG, 0)}${data.incompleteMass ? " + ?" : ""}`,
      unit: "g",
      note: "Assembled components",
      id: "mass-value",
      Icon: Weight,
    },
    {
      label: "CG offset",
      value: data.incompleteMass ? "Unknown" : number(data.cgOffsetMm),
      unit: data.incompleteMass ? "" : "mm",
      note: "XY from frame origin",
      id: "cg-value",
      Icon: Crosshair,
    },
    {
      label: "Thrust / weight",
      value: data.twr === null ? "N/A" : `${number(data.twr, 2)} : 1`,
      unit: "",
      note: "Demo 3S + 1045 data",
      id: "twr-value",
      Icon: Gauge,
    },
    {
      label: "Hover estimate",
      value: data.hoverMin === null ? "N/A" : number(data.hoverMin),
      unit: data.hoverMin === null ? "" : "min",
      note: "Approximate · unverified",
      id: "time-value",
      Icon: Clock3,
    },
  ];
  return (
    <>
      <div className="viewport-heading">
        <div>
          <div className="eyebrow">
            WORKSPACE <span>/</span> QUAD X PLATFORM
          </div>
          <h1>
            Assembly studio<span className="title-dot">.</span>
          </h1>
          <p>Design with intention. Build with precision.</p>
        </div>
        <div className="mode-toggle" role="group" aria-label="Workspace mode">
          <button
            className={`mode ${store.mode === "assembly" ? "active" : ""}`}
            data-mode="assembly"
            aria-pressed={store.mode === "assembly"}
            onClick={() => mode("assembly")}
          >
            <Box size={16} />
            <span>Assembly</span>
          </button>
          <button
            className={`mode ${store.mode === "wiring" ? "active" : ""}`}
            data-mode="wiring"
            aria-pressed={store.mode === "wiring"}
            onClick={() => mode("wiring")}
          >
            <GitBranch size={16} />
            <span>Wiring</span>
          </button>
        </div>
      </div>
      <div className="viewport-frame" id="viewport-frame">
        <div
          id="three-container"
          role="img"
          aria-label="Mô hình drone 3D tương tác"
        />
        <div className="overlay top-left">
          <span className="view-chip">
            <span className="status-led" />
            PERSPECTIVE <span className="technical">3D</span>
          </span>
          <span className="stage-caption">
            {store.mode === "assembly" ? "ASSEMBLY VIEW" : "CONNECTION VIEW"}
            <span>01 / QUAD X</span>
          </span>
        </div>
        <div className="overlay top-right camera-controls">
          <Button
            variant="outline"
            size="icon"
            id="camera-home"
            title="Đặt lại camera"
            aria-label="Đặt lại camera"
            onClick={() => model.current?.cameraHome()}
          >
            <House />
          </Button>
          <Button
            variant="outline"
            size="icon"
            id="camera-top"
            title="Góc nhìn từ trên"
            aria-label="Góc nhìn từ trên"
            onClick={() => model.current?.cameraTop()}
          >
            <Grid2X2 />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Hiện / ẩn grid"
            aria-label="Hiện / ẩn grid"
            onClick={() => {
              if (model.current)
                model.current.grid.visible = !model.current.grid.visible;
            }}
          >
            <ScanLine />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Fit workspace"
            aria-label="Fit workspace"
            onClick={() => model.current?.cameraFit()}
          >
            <Maximize2 />
          </Button>
        </div>
        <div className="overlay bottom-left">
          <div className="axis-legend">
            <span className="axis-x">X</span> Forward{" "}
            <span className="axis-y">Y</span> Right{" "}
            <span className="axis-z">Z</span> Up
          </div>
          <p id="drag-hint">
            {store.tool === "move"
              ? "Kéo linh kiện trên mặt phẳng XY · giữ cao độ Z"
              : "Drag to orbit · Scroll to zoom · Click to select"}
          </p>
        </div>
        <div className="overlay bottom-right toolstack">
          <button
            className={`tool ${store.tool === "select" ? "active" : ""}`}
            data-tool="select"
            aria-label="Select tool"
            aria-pressed={store.tool === "select"}
            onClick={() => tool("select")}
          >
            <MousePointer2 size={17} />
            <span>Select</span>
          </button>
          <button
            className={`tool ${store.tool === "move" ? "active" : ""}`}
            data-tool="move"
            aria-label="Move tool"
            aria-pressed={store.tool === "move"}
            onClick={() => tool("move")}
          >
            <Move size={17} />
            <span>Move</span>
          </button>
        </div>
        <div className="stage-scale">ENGINEERING / mm</div>
        <div id="viewport-error" role="status" />
      </div>
      <div className="viewport-status">
        <span className="status-led" />
        <span id="scene-status">
          {store.project.instances.length} parts ·{" "}
          {data.incompleteMass
            ? "CG unknown (missing mass)"
            : `CG (${data.cgMm.map((n) => number(n)).join(", ")}) mm`}
        </span>
        <span className="pipeline-status">LOCAL WORKSPACE</span>
      </div>
      <div className="under-viewport">
        <div className="explosion">
          <Layers size={18} />
          <label htmlFor="explode-slider">
            Exploded view<small>Visual separation only</small>
          </label>
          <input
            id="explode-slider"
            type="range"
            min="0"
            max="100"
            value={store.explode}
            onChange={(e) => {
              store.explode = Number(e.target.value);
              if (store.explode) {
                store.tool = "select";
                store.highlightedWire = "all";
              }
              store.changed(false);
            }}
          />
          <output id="explode-value">{store.explode}%</output>
        </div>
        <div className="visibility-controls">
          <label>
            <input
              id="show-labels"
              type="checkbox"
              checked={store.showLabels}
              onChange={(e) => {
                store.showLabels = e.target.checked;
                store.changed(false);
              }}
            />
            Labels
          </label>
          <label>
            <input
              id="show-clearance"
              type="checkbox"
              checked={store.showClearance}
              onChange={(e) => {
                store.showClearance = e.target.checked;
                store.changed(false);
              }}
            />
            Prop discs
          </label>
        </div>
      </div>
      <div className="analytics">
        {metrics.map(({ label, value, unit, note, id, Icon }) => (
          <div className="metric" key={id}>
            <div className="metric-label">
              {label}
              <Icon size={16} />
            </div>
            <div className="metric-value" id={id}>
              {value} <span>{unit}</span>
            </div>
            <p>{note}</p>
          </div>
        ))}
      </div>
      <button id="manifest-btn" className="manifest-link">
        <span>
          <Layers size={16} />
          Assembly manifest
        </span>
        <span>
          Specifications & component data
          <ArrowUpRight size={16} />
        </span>
      </button>
    </>
  );
}
