"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import type { TraceNode } from "@/lib/types";

/* ---------- layout constants ---------- */

const COL_WIDTH = 240; // horizontal gap per depth level
const ROW_HEIGHT = 70; // vertical room reserved per node

/** Node names that form the orchestration spine (critical path). */
const PRIMARY_NAMES = new Set(["run", "company"]);

/* ---------- custom node ---------- */

type StepNodeData = {
  label: string;
  ms: number;
  primary: boolean;
};

/**
 * One trace step rendered with design tokens. Run/company spine nodes carry the
 * primary accent to read as the critical path; leaf steps stay muted. Handles
 * are visually quiet so edges connect cleanly without dominating the node.
 */
function StepNode({ data }: NodeProps<Node<StepNodeData>>) {
  const { label, ms, primary } = data;
  return (
    <div
      className={cn(
        "min-w-[150px] rounded-md border px-3 py-2",
        primary
          ? "border-primary bg-primary-soft text-foreground"
          : "border-border bg-surface text-muted-foreground",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-border"
      />
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "truncate text-sm font-medium",
            primary ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
      <span className="tnum mt-0.5 block font-mono text-xs text-muted-foreground">
        {ms}ms
      </span>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-border"
      />
    </div>
  );
}

// Memoized OUTSIDE the component so React Flow doesn't warn about new objects.
const nodeTypes = { step: StepNode };

/* ---------- tree → graph flattening ---------- */

function buildGraph(
  root: TraceNode,
  animated: boolean,
): { nodes: Node<StepNodeData>[]; edges: Edge[] } {
  const nodes: Node<StepNodeData>[] = [];
  const edges: Edge[] = [];

  // Running y-offset per depth so siblings (and cousins) stack without overlap.
  const yByDepth = new Map<number, number>();
  let seq = 0;

  const walk = (node: TraceNode, depth: number, parentId: string | null) => {
    const id = `n${seq++}`;
    const y = yByDepth.get(depth) ?? 0;
    yByDepth.set(depth, y + ROW_HEIGHT);

    nodes.push({
      id,
      type: "step",
      position: { x: depth * COL_WIDTH, y },
      data: {
        label: node.name,
        ms: Math.round(node.ms),
        primary: PRIMARY_NAMES.has(node.name.toLowerCase()),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        type: "smoothstep",
        animated,
      });
    }

    for (const child of node.children) walk(child, depth + 1, id);
  };

  walk(root, 0, null);
  return { nodes, edges };
}

/* ---------- component ---------- */

/**
 * The signature trace visual: the agent run rendered as a left-to-right React
 * Flow graph. Each {@link TraceNode} becomes a node positioned by depth (x) and
 * a per-depth stacking offset (y); parent→child links are smoothstep edges that
 * animate to show flow (static under reduced motion). Client-only.
 */
export function TraceGraph({ trace }: { trace: TraceNode }) {
  const reduced = useReducedMotion();
  const animated = !reduced;

  const { nodes, edges } = useMemo(
    () => buildGraph(trace, animated),
    [trace, animated],
  );

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-lg border border-border bg-background/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        className="[&_.react-flow__edge-path]:stroke-border [&_.react-flow__handle]:!border-0"
      >
        <Background
          className="!bg-transparent"
          color="var(--color-border)"
          gap={20}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="!rounded-md !border !border-border !bg-surface !shadow-none [&_button]:!border-border [&_button]:!bg-surface [&_button]:!fill-foreground [&_button:hover]:!bg-muted"
        />
        <MiniMap
          className="hidden !rounded-md !border !border-border !bg-surface md:block"
          maskColor="var(--color-background)"
          nodeColor="var(--color-muted-foreground)"
          nodeStrokeWidth={0}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
