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
  { id: 'v101a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solvent Vessel', subtitle: 'Toluene', hoverDetails: '<b>Tag:</b> V-101A (FIC-101) <sup>[4]</sup><br/><b>Details:</b> 25 L Toluene <sup>[10]</sup><br/>FT-101 Coriolis Meter, FCV-101 Flow Valve', typeClass: 'node-input' } },
  { id: 'v101b', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solid Hopper', subtitle: 'Pyrmetazole', hoverDetails: '<b>Tag:</b> V-101B <sup>[4]</sup><br/><b>Details:</b> 6.2 kg Pyrmetazole (18.8 mol) <sup>[1, 10]</sup><br/>Rotary Airlock Valve', typeClass: 'node-input' } },
  { id: 'amine_in', type: 'custom', position: { x: 450, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Base Supply', subtitle: 'Amine', hoverDetails: '<b>Details:</b> 0.72 kg DIPEA ((iPr)2NEt) added to stabilize Ti-complex and buffer pH <sup>[1, 10]</sup>', typeClass: 'node-input' } },
  { id: 'det_in', type: 'custom', position: { x: 650, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Ligand Supply', subtitle: '(S,S)-DET', hoverDetails: '<b>Details:</b> 2.35 kg (11.4 mol) of (S,S)-Diethyl Tartrate <sup>[1]</sup><br/>XV-102 Dosing Valve', typeClass: 'node-input' } },
  { id: 'w_src', type: 'custom', position: { x: 850, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Supply', subtitle: 'Ultra-Pure', hoverDetails: '<b>Details:</b> Exactly 44 mL Water (2.4 mol) <sup>[1, 10]</sup><br/>Requires micro-capillary piping to avoid dead legs', typeClass: 'node-input' } },
  { id: 'p101', type: 'custom', position: { x: 850, y: 150 }, parentId: 'b1', extent: 'parent', data: { title: 'Micro-Pump', subtitle: 'Dosing', hoverDetails: '<b>Tag:</b> P-101<br/><b>Details:</b> High-Precision Metering Pump for 44 mL Water <sup>[4, 7]</sup>', typeClass: 'node-unitOp' } },
  { id: 'v101c', type: 'custom', position: { x: 1050, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Dosing Vessel', subtitle: 'Titanium Source', hoverDetails: '<b>Tag:</b> V-101C<br/><b>Details:</b> 1.60 kg Ti(OiPr)4 (5.6 mol) <sup>[1, 10]</sup><br/>Injected via sub-surface dip-tube (XV-103) <sup>[5]</sup>', typeClass: 'node-input' } },

  { id: 'n2_in', type: 'custom', position: { x: 50, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Inert Gas', subtitle: 'Nitrogen', hoverDetails: '<b>Loop:</b> PIC-101 <sup>[7]</sup><br/><b>Details:</b> N2 Purge (PT-101 / XV-101) to 1.1 bar', typeClass: 'node-input' } },
  { id: 'util_in', type: 'custom', position: { x: 50, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Utilities', subtitle: 'Heating/Cooling', hoverDetails: '<b>Loop:</b> TIC-101 <sup>[7]</sup><br/><b>Details:</b> Hot Water/Steam (TCV-101)<br/>Chilled Water (TCV-102)', typeClass: 'node-input' } },

  { id: 'e101', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b1', extent: 'parent', data: { title: 'Condenser', subtitle: 'Reflux', hoverDetails: '<b>Tag:</b> E-101<br/><b>Details:</b> Vertical Shell & Tube <sup>[6]</sup>', typeClass: 'node-unitOp' } },
  { id: 'ds_trap', type: 'custom', position: { x: 350, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Separator', subtitle: 'Azeotropic', hoverDetails: '<b>Details:</b> Dean-Stark Trap to azeotropically distill and remove residual water <sup>[1, 8]</sup>', typeClass: 'node-unitOp' } },
  { id: 'waste_water', type: 'custom', position: { x: 150, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Waste', subtitle: 'Azeotrope H2O', hoverDetails: '<b>Details:</b> Uncontrolled residual water removed prior to exact dosing', typeClass: 'node-waste' } },

  { id: 'r101', type: 'custom', position: { x: 550, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Complexation STR', subtitle: 'Reactor', hoverDetails: '<b>Tag:</b> R-101 <sup>[4]</sup><br/><b>Details:</b> Glass-Lined (GLR), VFD Agitator (M-101) <sup>[5]</sup><br/>Temp: 54°C (TIC-101), Time: 50 min <sup>[1]</sup><br/>Safety: Rupture Disc (PSE-101) <sup>[8]</sup>', typeClass: 'node-unitOp' } },
  { id: 'qc_port', type: 'custom', position: { x: 800, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'QC Sampling', subtitle: 'Karl Fischer', hoverDetails: '<b>Details:</b> Confirm moisture content &lt; 0.05% before Titanium addition <sup>[2]</sup>', typeClass: 'node-unitOp' } },
  { id: 'vent', type: 'custom', position: { x: 1050, y: 300 }, parentId: 'b1', extent: 'parent', data: { title: 'Vent System', subtitle: 'Pressure Relief', hoverDetails: '<b>Details:</b> Safe Vent / Knock-Out Drum <sup>[8]</sup><br/>PCV-101 / PRV-101', typeClass: 'node-waste' } },

  { id: 'cool_phase', type: 'custom', position: { x: 550, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Cooling Phase', subtitle: 'Equilibration', hoverDetails: '<b>Details:</b> Cool complex to 25°C via TCV-102 prior to transfer <sup>[1, 10]</sup>', typeClass: 'node-unitOp' } },

  { id: 'b1_out', type: 'custom', position: { x: 550, y: 700 }, parentId: 'b1', extent: 'parent', data: { title: 'Active Ti-Complex', subtitle: 'Intermediate', hoverDetails: '<b>Details:</b> Stereoselective dinuclear titanium-pyrmetazole complex dissolved in 25 L Toluene <sup>[1]</sup>', typeClass: 'node-product' } },

  // Block 2 Nodes
  { id: 'v102a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b2', extent: 'parent', data: { title: 'Oxidant Vessel', subtitle: 'CHP', hoverDetails: '<b>Tag:</b> V-102A <sup>[4]</sup><br/><b>Details:</b> 3.30 kg Cumene Hydroperoxide (CHP) <sup>[1, 10]</sup><br/>Thermally sensitive oxidant <sup>[8]</sup>', typeClass: 'node-input' } },
  { id: 'p102', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b2', extent: 'parent', data: { title: 'Dosing Pump', subtitle: 'Controlled Flow', hoverDetails: '<b>Tag:</b> P-102<br/><b>Details:</b> High-precision slow addition over 1 hour to control exotherm <sup>[5]</sup>', typeClass: 'node-unitOp' } },
  { id: 'util_cool', type: 'custom', position: { x: 50, y: 250 }, parentId: 'b2', extent: 'parent', data: { title: 'Chilled Water', subtitle: 'Max Cooling', hoverDetails: '<b>Loop:</b> TIC-102 <sup>[7]</sup><br/><b>Details:</b> Required to absorb large exothermic heat of reaction (ΔH = -250 to -350 kJ/mol) <sup>[2]</sup>', typeClass: 'node-input' } },
  { id: 'r102', type: 'custom', position: { x: 250, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Oxidation STR', subtitle: 'Reaction Phase', hoverDetails: '<b>Tag:</b> R-102 (or Phase 2 of R-101) <sup>[4]</sup><br/><b>Details:</b> Temp: 30°C (strictly controlled) <sup>[1]</sup><br/>Time: 1 hour<br/>Safety: High temperature alarm to prevent sulfone formation <sup>[8]</sup>', typeClass: 'node-unitOp' } },
  { id: 'b2_out', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Crude Extract', subtitle: 'Crude Esomeprazole', hoverDetails: '<b>Details:</b> Enantiomeric Excess (ee) >94% <sup>[1, 10]</sup><br/>Contains unreacted pyrmetazole, Ti-complex, and Toluene', typeClass: 'node-product' } },

  // Block 3 Nodes
  { id: 'v104a', type: 'custom', position: { x: 30, y: 250 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous NH3', subtitle: '12.5%', hoverDetails: '<b>Tag:</b> V-104A<br/><b>Details:</b> 60 L Aqueous Ammonium Hydroxide (12.5% NH3) <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'w_tol', type: 'custom', position: { x: 530, y: 250 }, parentId: 'b3', extent: 'parent', data: { title: 'Waste Toluene', subtitle: 'SRU', hoverDetails: '<b>Details:</b> Spent Toluene with degraded Ti-catalyst <sup>[8]</sup><br/>Routed to Solvent Recovery Unit (SRU)', typeClass: 'node-waste' } },
  { id: 'ex101', type: 'custom', position: { x: 270, y: 350 }, parentId: 'b3', extent: 'parent', data: { title: 'Primary Extractor', subtitle: 'Mixer-Settler', hoverDetails: '<b>Tag:</b> EX-101 <sup>[6]</sup><br/><b>Details:</b> Jacketed Stirred Tank (GLR/SS316L)<br/>Phase Boundary Control (LIC-101 / LT-101) <sup>[7]</sup><br/>Bottom drain valve XV-105', typeClass: 'node-unitOp' } },
  
  { id: 'v104c', type: 'custom', position: { x: 30, y: 450 }, parentId: 'b3', extent: 'parent', data: { title: 'Acetic Acid', subtitle: 'pH Adjust', hoverDetails: '<b>Tag:</b> V-104C<br/><b>Details:</b> Concentrated Acetic Acid for re-protonation <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'v103', type: 'custom', position: { x: 270, y: 450 }, parentId: 'b3', extent: 'parent', data: { title: 'Secondary Extractor', subtitle: 'pH Adjustment Vessel', hoverDetails: '<b>Tag:</b> V-103 <sup>[4]</sup><br/><b>Details:</b> Hastelloy C-276 STR<br/>pH Modulation Loop (AIC-101 / AT-101) to pH 7.5-8.5 <sup>[7]</sup>', typeClass: 'node-unitOp' } },
  
  { id: 'v104b', type: 'custom', position: { x: 30, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'MIBK Solvent', subtitle: 'Extraction', hoverDetails: '<b>Tag:</b> V-104B<br/><b>Details:</b> 18 L total Methyl Isobutyl Ketone (MIBK) <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'w_aq', type: 'custom', position: { x: 530, y: 650 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous Waste', subtitle: 'ETP', hoverDetails: '<b>Details:</b> Spent aqueous ammonium acetate <sup>[8]</sup><br/>Routed to Effluent Treatment Plant (ETP)', typeClass: 'node-waste' } },
  { id: 'b3_out', type: 'custom', position: { x: 530, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'Purified Free Base', subtitle: 'In MIBK', hoverDetails: '<b>Details:</b> Highly purified esomeprazole free base dissolved in 9 L MIBK <sup>[3, 10]</sup>', typeClass: 'node-product' } },

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
  { id: 'e-v102a-p102', source: 'v102a', target: 'p102', type: 'step' },
  { id: 'e-p102-r102', source: 'p102', target: 'r102', type: 'step', label: '1 Hr Metered Addition' },
  { id: 'e-b1-r102', source: 'b1_out', target: 'r102', type: 'step' },
  { id: 'e-util-r102', source: 'util_cool', target: 'r102', type: 'step', label: 'TCV-102' },
  { id: 'e-r102-b2', source: 'r102', target: 'b2_out', type: 'step' },

  // B3
  { id: 'e-b2-ex101', source: 'b2_out', target: 'ex101', type: 'step' },
  { id: 'e-v104a-ex101', source: 'v104a', target: 'ex101', type: 'step' },
  { id: 'e-ex101-w_tol', source: 'ex101', target: 'w_tol', type: 'step', className: 'waste-edge', label: 'Organic Waste Phase' },
  
  { id: 'e-ex101-v103', source: 'ex101', target: 'v103', type: 'step', label: 'Aqueous Phase (LIC-101)' },
  { id: 'e-v104c-v103', source: 'v104c', target: 'v103', type: 'step', label: 'AIC-101' },
  { id: 'e-v104b-v103', source: 'v104b', target: 'v103', type: 'step' },
  
  { id: 'e-v103-w_aq', source: 'v103', target: 'w_aq', type: 'step', className: 'waste-edge', label: 'Aqueous Waste Phase' },
  { id: 'e-v103-b3', source: 'v103', target: 'b3_out', type: 'step', label: 'MIBK Extract' },

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
              <li>[1] Cotton, H., et al. (2000). "Asymmetric synthesis of esomeprazole." <i>Tetrahedron: Asymmetry</i>, 11(18), 3819-3825.</li>
              <li>[2] Song, et al. (2014) & Li, et al. (2014). Reaction scale-up and optimization parameters.</li>
            </ul>
            <strong>Patents</strong>
            <ul>
              <li>[3] US Patent 6,174,548 & US Patent 6,369,085 (AstraZeneca). Salt formation, extraction, & crystallization.</li>
            </ul>
            <strong>Engineering Design & Handbooks</strong>
            <ul>
              <li>[4] Turton, R., et al. (2018). <i>Analysis, Synthesis, and Design of Chemical Processes</i>.</li>
              <li>[5] Levin, M. (Ed.). <i>Pharmaceutical Process Scale-Up</i>.</li>
              <li>[6] Green, D. W. <i>Perry's Chemical Engineers' Handbook</i>.</li>
              <li>[7] Lipták, B. G. <i>Instrument Engineers' Handbook</i>.</li>
              <li>[8] <i>Active Pharmaceutical Ingredients: Development, Manufacturing, and Regulation</i>.</li>
            </ul>
            <strong>Internal Documentation</strong>
            <ul>
              <li>[9] <i>Process Selection & Justification</i></li>
              <li>[10] <i>Equipment Mass/Energy Balances & Design Specifications</i></li>
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
