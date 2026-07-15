import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const CustomNode = ({ data }) => {
  return (
    <div className={`custom-node ${data.typeClass}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-title">{data.title}</div>
      {data.subtitle && <div className="node-subtitle" dangerouslySetInnerHTML={{ __html: data.subtitle }}></div>}
      {data.hoverDetails && (
        <div className="node-tooltip" dangerouslySetInnerHTML={{ __html: data.hoverDetails }}></div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const initialNodes = [
  // Groups
  { id: 'b1', type: 'group', position: { x: 0, y: 0 }, style: { width: 1350, height: 850 }, data: { label: 'Block 1: Raw Material & Catalyst Complexation' } },
  { id: 'b2', type: 'group', position: { x: 1450, y: 150 }, style: { width: 750, height: 450 }, data: { label: 'Block 2: Catalytic Asymmetric Sulfoxidation' } },
  { id: 'b3', type: 'group', position: { x: 2300, y: 0 }, style: { width: 800, height: 750 }, data: { label: 'Block 3: Extraction and Phase Separation' } },
  { id: 'b4', type: 'group', position: { x: 3200, y: 350 }, style: { width: 1050, height: 400 }, data: { label: 'Block 4: API Salt Formation' } },
  { id: 'b5', type: 'group', position: { x: 4350, y: 350 }, style: { width: 1050, height: 400 }, data: { label: 'Block 5: Crystallization and Final Isolation' } },

  // Block 1 Nodes
  { id: 'v101a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solvent Vessel', subtitle: 'Toluene', hoverDetails: '<b>Tag:</b> V-101A<br/><b>Details:</b> 25 L Toluene<br/>FT-101 Coriolis Meter', typeClass: 'node-input' } },
  { id: 'v101b', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solid Hopper', subtitle: 'Pyrmetazole', hoverDetails: '<b>Tag:</b> V-101B<br/><b>Details:</b> 6.2 kg Pyrmetazole (Sulphide 1)<br/>Rotary Airlock', typeClass: 'node-input' } },
  { id: 'amine_in', type: 'custom', position: { x: 450, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Base Supply', subtitle: 'Amine', hoverDetails: '<b>Details:</b> 0.72 kg DIPEA ((iPr)2NEt) added to stabilize Ti-complex and buffer pH', typeClass: 'node-input' } },
  { id: 'det_in', type: 'custom', position: { x: 650, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Ligand Supply', subtitle: '(S,S)-DET', hoverDetails: '<b>Details:</b> 2.35 kg of (S,S)-Diethyl Tartrate', typeClass: 'node-input' } },
  { id: 'w_src', type: 'custom', position: { x: 850, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Supply', subtitle: 'Ultra-Pure', hoverDetails: '<b>Details:</b> Exactly 44 mL Water to control Ti-complex stoichiometry', typeClass: 'node-input' } },
  { id: 'p101', type: 'custom', position: { x: 850, y: 150 }, parentId: 'b1', extent: 'parent', data: { title: 'Micro-Pump', subtitle: 'Dosing', hoverDetails: '<b>Tag:</b> P-101<br/><b>Details:</b> High-Precision Dosing for 44 mL Water', typeClass: 'node-unitOp' } },
  { id: 'v101c', type: 'custom', position: { x: 1050, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Dosing Vessel', subtitle: 'Titanium Source', hoverDetails: '<b>Tag:</b> V-101C<br/><b>Details:</b> 1.60 kg Ti(OiPr)4<br/>Strictly Inerted', typeClass: 'node-input' } },

  { id: 'n2_in', type: 'custom', position: { x: 50, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Inert Gas', subtitle: 'Nitrogen', hoverDetails: '<b>Details:</b> N2 Purge for moisture/oxygen sensitivity', typeClass: 'node-input' } },
  { id: 'util_in', type: 'custom', position: { x: 50, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Utilities', subtitle: 'Heating/Cooling', hoverDetails: '<b>Details:</b> Hot Water & Chilled Water Headers<br/>TCV-101 / TCV-102', typeClass: 'node-input' } },

  { id: 'e101', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b1', extent: 'parent', data: { title: 'Condenser', subtitle: 'Reflux', hoverDetails: '<b>Tag:</b> E-101<br/><b>Details:</b> Vertical Shell & Tube', typeClass: 'node-unitOp' } },
  { id: 'ds_trap', type: 'custom', position: { x: 350, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Separator', subtitle: 'Azeotropic', hoverDetails: '<b>Details:</b> Dean-Stark Trap to azeotropically distill and remove residual water from Pyrmetazole/Toluene mixture', typeClass: 'node-unitOp' } },
  { id: 'waste_water', type: 'custom', position: { x: 150, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Waste', subtitle: 'Azeotrope H2O', hoverDetails: '<b>Details:</b> Uncontrolled residual water removed prior to exact dosing', typeClass: 'node-waste' } },

  { id: 'r101', type: 'custom', position: { x: 550, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Complexation STR', subtitle: 'Reactor', hoverDetails: '<b>Tag:</b> R-101<br/><b>Details:</b> Glass-Lined, VFD Agitator (M-101)<br/>Temp: 54°C, Time: 50 min', typeClass: 'node-unitOp' } },
  { id: 'qc_port', type: 'custom', position: { x: 800, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'QC Sampling', subtitle: 'Karl Fischer', hoverDetails: '<b>Details:</b> Confirm moisture content &lt; 0.05% before Titanium addition', typeClass: 'node-unitOp' } },
  { id: 'vent', type: 'custom', position: { x: 1050, y: 300 }, parentId: 'b1', extent: 'parent', data: { title: 'Vent System', subtitle: 'Pressure Relief', hoverDetails: '<b>Details:</b> Safe Vent / Knock-Out Drum<br/>PCV-101 / PRV-101', typeClass: 'node-waste' } },

  { id: 'cool_phase', type: 'custom', position: { x: 550, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Cooling Phase', subtitle: 'Equilibration', hoverDetails: '<b>Details:</b> Cool complex to 25°C prior to transfer and oxidation step', typeClass: 'node-unitOp' } },

  { id: 'b1_out', type: 'custom', position: { x: 550, y: 700 }, parentId: 'b1', extent: 'parent', data: { title: 'Active Ti-Complex', subtitle: 'Intermediate', hoverDetails: '<b>Details:</b> Homogeneous Suspension at 25°C ready for oxidation', typeClass: 'node-product' } },

  // Block 2 Nodes
  { id: 'i5', type: 'custom', position: { x: 30, y: 100 }, parentId: 'b2', extent: 'parent', data: { title: 'DIPEA', subtitle: 'Amine Base', typeClass: 'node-input' } },
  { id: 'i6', type: 'custom', position: { x: 30, y: 300 }, parentId: 'b2', extent: 'parent', data: { title: 'CHP', subtitle: 'Cumene Hydroperoxide', typeClass: 'node-input' } },
  { id: 'r2', type: 'custom', position: { x: 270, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Reactor 2: Oxidation', subtitle: 'Temp: 25°C - 30°C<br/>Time: 1 - 3 hours', typeClass: 'node-unitOp' } },
  { id: 'b2_out', type: 'custom', position: { x: 530, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Crude Extract', subtitle: 'Crude Esomeprazole<br/>>94% ee', typeClass: 'node-product' } },

  // Block 3 Nodes
  { id: 'i7', type: 'custom', position: { x: 30, y: 250 }, parentId: 'b3', extent: 'parent', data: { title: 'Aq. NH4OH', subtitle: 'Aqueous Ammonium Hydroxide', typeClass: 'node-input' } },
  { id: 'w1', type: 'custom', position: { x: 530, y: 250 }, parentId: 'b3', extent: 'parent', data: { title: 'Waste', subtitle: 'Spent Catalyst & Unreacted Organics', typeClass: 'node-waste' } },
  { id: 'ex1', type: 'custom', position: { x: 270, y: 350 }, parentId: 'b3', extent: 'parent', data: { title: 'Primary Extractor', subtitle: '', typeClass: 'node-unitOp' } },
  
  { id: 'i8', type: 'custom', position: { x: 30, y: 450 }, parentId: 'b3', extent: 'parent', data: { title: 'Acetic Acid', subtitle: '', typeClass: 'node-input' } },
  { id: 'ph1', type: 'custom', position: { x: 270, y: 450 }, parentId: 'b3', extent: 'parent', data: { title: 'pH Adjustment Vessel', subtitle: 'Aqueous Product Phase', typeClass: 'node-unitOp' } },
  
  { id: 'i9', type: 'custom', position: { x: 30, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'MIBK Solvent', subtitle: '', typeClass: 'node-input' } },
  { id: 'ex2', type: 'custom', position: { x: 270, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'Secondary Extractor', subtitle: '', typeClass: 'node-unitOp' } },
  { id: 'w2', type: 'custom', position: { x: 530, y: 650 }, parentId: 'b3', extent: 'parent', data: { title: 'Waste', subtitle: 'Aqueous Effluent', typeClass: 'node-waste' } },
  { id: 'b3_out', type: 'custom', position: { x: 530, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'Purified Free Base', subtitle: 'In MIBK', typeClass: 'node-product' } },

  // Block 4 Nodes
  { id: 'i10', type: 'custom', position: { x: 30, y: 200 }, parentId: 'b4', extent: 'parent', data: { title: 'Alkaline Source', subtitle: 'KOH/Methoxide', typeClass: 'node-input' } },
  { id: 'sf1', type: 'custom', position: { x: 270, y: 200 }, parentId: 'b4', extent: 'parent', data: { title: 'Reactor 3', subtitle: 'Intermediate Salt Formation', typeClass: 'node-unitOp' } },
  { id: 'i11', type: 'custom', position: { x: 270, y: 320 }, parentId: 'b4', extent: 'parent', data: { title: 'MgSO4', subtitle: 'Magnesium Sulfate', typeClass: 'node-input' } },
  { id: 'sf2', type: 'custom', position: { x: 530, y: 200 }, parentId: 'b4', extent: 'parent', data: { title: 'Reactor 4', subtitle: 'Magnesium Exchange', typeClass: 'node-unitOp' } },
  { id: 'b4_out', type: 'custom', position: { x: 790, y: 200 }, parentId: 'b4', extent: 'parent', data: { title: 'Salt Solution', subtitle: 'Esomeprazole Mg', typeClass: 'node-product' } },

  // Block 5 Nodes
  { id: 'i12', type: 'custom', position: { x: 30, y: 200 }, parentId: 'b5', extent: 'parent', data: { title: 'Anti-Solvent', subtitle: 'Acetone / Methanol', typeClass: 'node-input' } },
  { id: 'cr1', type: 'custom', position: { x: 270, y: 200 }, parentId: 'b5', extent: 'parent', data: { title: 'Crystallizer', subtitle: 'Concentration & Cooling', typeClass: 'node-unitOp' } },
  { id: 'fl1', type: 'custom', position: { x: 530, y: 200 }, parentId: 'b5', extent: 'parent', data: { title: 'Filter Dryer', subtitle: 'Agitated Nutsche<br/>Filtration & Vacuum Drying', typeClass: 'node-unitOp' } },
  { id: 'sru', type: 'custom', position: { x: 530, y: 80 }, parentId: 'b5', extent: 'parent', data: { title: 'SRU', subtitle: 'Solvent Recovery Unit', typeClass: 'node-waste' } },
  { id: 'out', type: 'custom', position: { x: 790, y: 200 }, parentId: 'b5', extent: 'parent', data: { title: 'Esomeprazole API', subtitle: 'Final Product<br/>>99.5% ee', typeClass: 'node-product' } },
];

const initialEdges = [
  // Block 1 Edges
  { id: 'e-v101a-r101', source: 'v101a', target: 'r101', type: 'step', label: 'FCV' },
  { id: 'e-v101b-r101', source: 'v101b', target: 'r101', type: 'step', label: 'Solid' },
  { id: 'e-amine-r101', source: 'amine_in', target: 'r101', type: 'step', label: 'Buffer' },
  { id: 'e-det-r101', source: 'det_in', target: 'r101', type: 'step', label: 'XV-102' },
  { id: 'e-w-p101', source: 'w_src', target: 'p101', type: 'step' },
  { id: 'e-p101-r101', source: 'p101', target: 'r101', type: 'step', label: 'Dosing' },
  { id: 'e-v101c-r101', source: 'v101c', target: 'r101', type: 'step', label: 'XV-103' },
  { id: 'e-n2-r101', source: 'n2_in', target: 'r101', type: 'step', label: 'Purge' },
  
  // Azeotropic distillation loop
  { id: 'e-r101-e101', source: 'r101', target: 'e101', label: 'Vapor' },
  { id: 'e-e101-ds', source: 'e101', target: 'ds_trap', type: 'step', label: 'Condensate' },
  { id: 'e-ds-r101', source: 'ds_trap', target: 'r101', type: 'step', label: 'Dry Reflux' },
  { id: 'e-ds-waste', source: 'ds_trap', target: 'waste_water', type: 'step', className: 'waste-edge' },
  
  { id: 'e-r101-qc', source: 'r101', target: 'qc_port', label: 'Sample' },
  { id: 'e-r101-vent', source: 'r101', target: 'vent', type: 'step', label: 'Vent' },
  { id: 'e-util-r101', source: 'util_in', target: 'r101', type: 'step', label: 'TCV' },
  { id: 'e-r101-cool', source: 'r101', target: 'cool_phase', type: 'step', label: '50°C -> 25°C' },
  { id: 'e-cool-b1', source: 'cool_phase', target: 'b1_out', type: 'step', label: 'Transfer' },

  // B2
  { id: 'e-b1-r2', source: 'b1_out', target: 'r2', type: 'step' },
  { id: 'e-i5-r2', source: 'i5', target: 'r2', type: 'step' },
  { id: 'e-i6-r2', source: 'i6', target: 'r2', type: 'step', label: 'Metered Addition' },
  { id: 'e-r2-b2', source: 'r2', target: 'b2_out', type: 'step' },

  // B3
  { id: 'e-b2-ex1', source: 'b2_out', target: 'ex1', type: 'step' },
  { id: 'e-i7-ex1', source: 'i7', target: 'ex1', type: 'step' },
  { id: 'e-ex1-w1', source: 'ex1', target: 'w1', type: 'step', className: 'waste-edge', label: 'Organic Waste Phase' },
  
  { id: 'e-ex1-ph1', source: 'ex1', target: 'ph1', type: 'step' },
  { id: 'e-i8-ph1', source: 'i8', target: 'ph1', type: 'step' },
  
  { id: 'e-ph1-ex2', source: 'ph1', target: 'ex2', type: 'step' },
  { id: 'e-i9-ex2', source: 'i9', target: 'ex2', type: 'step' },
  { id: 'e-ex2-w2', source: 'ex2', target: 'w2', type: 'step', className: 'waste-edge', label: 'Aqueous Waste Phase' },
  { id: 'e-ex2-b3', source: 'ex2', target: 'b3_out', type: 'step' },

  // B4
  { id: 'e-b3-sf1', source: 'b3_out', target: 'sf1', type: 'step' },
  { id: 'e-i10-sf1', source: 'i10', target: 'sf1', type: 'step' },
  { id: 'e-sf1-sf2', source: 'sf1', target: 'sf2', type: 'step', label: 'Potassium Salt' },
  { id: 'e-i11-sf2', source: 'i11', target: 'sf2', type: 'step' },
  { id: 'e-sf2-b4', source: 'sf2', target: 'b4_out', type: 'step' },

  // B5
  { id: 'e-b4-cr1', source: 'b4_out', target: 'cr1', type: 'step' },
  { id: 'e-i12-cr1', source: 'i12', target: 'cr1', type: 'step' },
  { id: 'e-cr1-fl1', source: 'cr1', target: 'fl1', type: 'step', label: 'API Slurry' },
  { id: 'e-fl1-sru', source: 'fl1', target: 'sru', type: 'step', className: 'waste-edge', label: 'Mother Liquor' },
  { id: 'e-fl1-out', source: 'fl1', target: 'out', type: 'step', className: 'product-edge' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showRefs, setShowRefs] = useState(false);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <>
      <header>
        <h1>Esomeprazole API Synthesis</h1>
        <p>Process Flow Diagram (PFD)</p>
      </header>
      
      <div className="references-container">
        <button className="ref-button" onClick={() => setShowRefs(!showRefs)}>
          📚 Process References {showRefs ? '▲' : '▼'}
        </button>
        {showRefs && (
          <div className="ref-dropdown">
            <strong>Primary Literature</strong>
            <ul>
              <li>Cotton, H., et al. (2000). "Asymmetric synthesis of esomeprazole." <i>Tetrahedron: Asymmetry</i>, 11(18), 3819-3825.</li>
              <li>Song, et al. (2014) & Li, et al. (2014). Reaction scale-up and optimization parameters.</li>
            </ul>
            <strong>Patents</strong>
            <ul>
              <li>US Patent 6,174,548 & US Patent 6,369,085 (AstraZeneca). Salt formation & crystallization.</li>
            </ul>
            <strong>Engineering Design</strong>
            <ul>
              <li>Turton, R., et al. (2018). <i>Analysis, Synthesis, and Design of Chemical Processes</i> (5th ed.).</li>
              <li>Peters, M., & Timmerhaus, K. <i>Plant Design and Economics for Chemical Engineers</i>.</li>
              <li>Levin, M. (Ed.). <i>Pharmaceutical Process Scale-Up</i>.</li>
            </ul>
          </div>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </>
  );
}
