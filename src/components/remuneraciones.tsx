import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";

const nodes = [
  {
    id: "voluntary-contributions",
    data: { label: "Aportes voluntarios" },
    position: { x: 50, y: 200 },
    type: "default",
  },
  { id: "user-1", data: { label: "Usuario 1" }, position: { x: 250, y: 100 } },
  { id: "user-2", data: { label: "Usuario 2" }, position: { x: 250, y: 180 } },
  { id: "user-3", data: { label: "Usuario 3" }, position: { x: 250, y: 260 } },
  { id: "content-1", data: { label: "" }, position: { x: 450, y: 80 } },
  { id: "content-2", data: { label: "" }, position: { x: 450, y: 140 } },
  { id: "content-3", data: { label: "" }, position: { x: 450, y: 200 } },
  { id: "content-4", data: { label: "" }, position: { x: 450, y: 260 } },
];

const edges = [
  { id: "e1", source: "voluntary-contributions", target: "user-1" },
  { id: "e2", source: "voluntary-contributions", target: "user-2" },
  { id: "e3", source: "voluntary-contributions", target: "user-3" },
  { id: "e4", source: "user-1", target: "content-1" },
  { id: "e5", source: "user-2", target: "content-2" },
  { id: "e6", source: "user-2", target: "content-3" },
  { id: "e7", source: "user-3", target: "content-4" },
];

const Diagram = () => {
  return (
    <div className="h-screen bg-gray-100">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Diagram;
