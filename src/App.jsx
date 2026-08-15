import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Handle,
  NodeResizer,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const getUnitOperationType = (data) => {
  if (data.unitOperation) return data.unitOperation;
  const title = data.title || '';
  if (/Pump/i.test(title)) return 'Metered liquid dosing';
  if (/Hopper/i.test(title)) return 'Solids charging';
  if (/Extractor|Mixer/i.test(title)) return 'Liquid–liquid extraction and phase separation';
  if (/Receiver/i.test(title)) return 'Intermediate hold / surge';
  if (/Reactor|STR/i.test(title)) return 'Agitated reaction or precipitation';
  if (/Separator|Condenser/i.test(title)) return 'Condensation / phase separation';
  if (/Vessel|Supply|Source|Ammonia|Acid|MIBK|Hydroxide|Acetonitrile|Water|Oxidant|Magnesium Chloride/i.test(title)) return 'Feed vessel / dosing point';
  if (/Filter|ANFD/i.test(title)) return 'Solid–liquid filtration';
  if (/Mill|Sieve/i.test(title)) return 'Particle-size conditioning';
  if (/Sampling|Check/i.test(title)) return 'In-process quality-control sampling';
  if (/Cooling Phase/i.test(title)) return 'Controlled cooling / equilibration';
  if (/Vent/i.test(title)) return 'Pressure relief / vent handling';
  if (data.typeClass === 'node-input') return 'Material / utility feed';
  if (data.typeClass === 'node-waste') return 'Waste or recovery outlet';
  if (data.typeClass === 'node-product') return 'Intermediate / product handoff';
  return 'Process unit operation';
};

const getPfdRepresentation = (data) => {
  if (data.pfdRepresentation) return data.pfdRepresentation;
  const title = data.title || '';
  if (/Filter|ANFD/i.test(title)) return 'Filter box with cake and filtrate outlets';
  if (/Reactor|STR|Extractor|Receiver/i.test(title)) return 'Vessel box with feed and product arrows';
  if (/Condenser|Separator/i.test(title)) return 'Heat-exchanger/separator box with return and outlet';
  if (/Pump/i.test(title)) return 'Pump symbol on metered feed line';
  if (/Mill|Sieve/i.test(title)) return 'Milling/sieving box on dry-solid line';
  if (/Sampling|Check/i.test(title)) return 'QC sample point attached to stream';
  if (data.typeClass === 'node-input') return 'Feed arrow to vessel or unit';
  if (data.typeClass === 'node-waste') return 'Waste/recovery arrow from unit';
  if (data.typeClass === 'node-product') return 'Product/intermediate stream arrow';
  return 'Equipment box with inlet/outlet streams';
};

const CustomNode = ({ data }) => {
  const detailHeader = `<b>Label:</b> ${data.title}<br/><b>Unit operation:</b> ${getUnitOperationType(data)}<br/><b>PFD representation:</b> ${getPfdRepresentation(data)}<br/>`;
  return (
    <div className={`custom-node ${data.typeClass}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-title">{data.title}</div>
      {data.subtitle && <div className="node-subtitle" dangerouslySetInnerHTML={{ __html: data.subtitle }}></div>}
      {data.hoverDetails && (
        <div className="node-tooltip" dangerouslySetInnerHTML={{ __html: detailHeader + data.hoverDetails }}></div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const GroupNode = ({ data, selected }) => (
  <>
    <NodeResizer
      isVisible={selected}
      minWidth={500}
      minHeight={300}
      lineStyle={{ borderStyle: 'dotted' }}
      handleStyle={{ width: 10, height: 10, borderRadius: 0 }}
    />
    <div className="group-node-label">{data.label}</div>
  </>
);

nodeTypes.group = GroupNode;

const initialNodes = [
  // Groups
  { id: 'b1', type: 'group', position: { x: 0, y: 0 }, style: { width: 1350, height: 850 }, data: { label: 'Block 1: Raw Material & Catalyst Complexation' } },
  { id: 'b2', type: 'group', position: { x: 1450, y: 150 }, style: { width: 750, height: 450 }, data: { label: 'Block 2: Catalytic Asymmetric Sulfoxidation' } },
  { id: 'b3', type: 'group', position: { x: 2300, y: 0 }, style: { width: 1450, height: 850 }, data: { label: 'Block 3: Extraction, Sodium-Salt Formation & Isolation' } },
  { id: 'b4', type: 'group', position: { x: 3850, y: 100 }, style: { width: 950, height: 650 }, data: { label: 'Block 4: Aqueous Magnesium-Salt Precipitation' } },
  { id: 'b5', type: 'group', position: { x: 4900, y: 150 }, style: { width: 950, height: 550 }, data: { label: 'Block 5: Wet-Cake Conditioning, Drying & Packaging' } },

  // Block 1 Nodes
  { id: 'v101a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solvent Vessel', subtitle: 'Toluene', hoverDetails: '<b>Tag:</b> V-101A <sup>[4]</sup><br/><b>Type:</b> Toluene charge vessel &rarr; R-101<br/><b>How:</b> FT-101 Coriolis meter totalizes mass flow to the DCS, which snaps FCV-101 shut the instant 25 L is reached — the charge is exact no matter how the pump drifts.<br/><b>Spec:</b> 25 L toluene (reaction solvent) <sup>[7, 10]</sup>', typeClass: 'node-input' } },
  { id: 'v101b', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solid Hopper', subtitle: 'Pyrmetazole', hoverDetails: '<b>Tag:</b> V-101B <sup>[4]</sup><br/><b>Type:</b> Solid charge hopper<br/><b>How:</b> A rotary airlock turns the solid in through sealed pockets, metering it into the stirred toluene without ever opening the vessel to air (keeps the N&#8322; blanket intact).<br/><b>Spec:</b> 6.2 kg pyrmetazole (18.8 mol) <sup>[1, 10]</sup>', typeClass: 'node-input' } },
  { id: 'amine_in', type: 'custom', position: { x: 450, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Base Supply', subtitle: 'Amine', hoverDetails: '<b>Type:</b> DIPEA base charge (metered liquid)<br/><b>How:</b> The tertiary amine mops up trace acid so the titanium&ndash;tartrate complex can&rsquo;t acid-decompose, and buffers the batch pH steady.<br/><b>Spec:</b> 0.72 kg DIPEA ((iPr)&#8322;NEt) <sup>[1, 10]</sup>', typeClass: 'node-input' } },
  { id: 'det_in', type: 'custom', position: { x: 650, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Ligand Supply', subtitle: '(S,S)-DET', hoverDetails: '<b>Type:</b> Chiral ligand charge via XV-102<br/><b>How:</b> XV-102 opens once at temperature; the tartrate chelates titanium and its (S,S) handedness is what forces the S-sulfoxide downstream — this is the step that makes the drug &ldquo;eso&rdquo;.<br/><b>Spec:</b> 2.35 kg (11.4 mol) (S,S)-diethyl tartrate <sup>[1]</sup>', typeClass: 'node-input' } },
  { id: 'w_src', type: 'custom', position: { x: 850, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Supply', subtitle: 'Catalyst Activation', hoverDetails: '<b>Type:</b> Qualified water charge<br/><b>Duty:</b> Supply the controlled water charge used during titanium–tartrate complex preparation. The approved batch record defines the amount and addition sequence. <sup>[1]</sup>', typeClass: 'node-input' } },
  { id: 'p101', type: 'custom', position: { x: 850, y: 150 }, parentId: 'b1', extent: 'parent', data: { title: 'Micro-Pump', subtitle: 'Water Dosing', hoverDetails: '<b>Tag:</b> P-101<br/><b>Type:</b> Metered liquid dosing pump<br/><b>Duty:</b> Transfer the qualified water charge into the complexation reactor at the approved addition point and rate.', typeClass: 'node-unitOp' } },
  { id: 'v101c', type: 'custom', position: { x: 1050, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Dosing Vessel', subtitle: 'Titanium Source', hoverDetails: '<b>Tag:</b> V-101C<br/><b>Type:</b> Inerted micro-dosing vessel<br/><b>How:</b> Air-sensitive Ti(OiPr)&#8324; is pushed under N&#8322; pressure through XV-103 down a dip-tube that discharges below the liquid line — no splashing onto dry walls where it would gel. <sup>[5]</sup><br/><b>Spec:</b> 1.60 kg Ti(OiPr)&#8324; (5.6 mol) <sup>[1, 10]</sup>', typeClass: 'node-input' } },

  { id: 'n2_in', type: 'custom', position: { x: 50, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Inert Gas', subtitle: 'Nitrogen', hoverDetails: '<b>Loop:</b> PIC-101 (inerting) <sup>[7]</sup><br/><b>Type:</b> N&#8322; purge / blanket<br/><b>How:</b> PT-101 watches headspace pressure; when it sags, XV-101 pulses N&#8322; in and PCV-101 bleeds off the displaced air, holding a slight positive pressure so air can never leak in and oxidize the catalyst.<br/><b>Spec:</b> ~1.1 bar positive', typeClass: 'node-input' } },
  { id: 'util_in', type: 'custom', position: { x: 50, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Utilities', subtitle: 'Heating/Cooling', hoverDetails: '<b>Loop:</b> TIC-101 (jacket) <sup>[7]</sup><br/><b>Type:</b> Reactor-jacket thermal utility<br/><b>How:</b> TT-101 (tantalum tip survives the process fluid) drives a PID that strokes TCV-101 to add hot water/LP steam or TCV-102 to add chilled water, holding the jacket so the bulk sits at setpoint.<br/><b>Spec:</b> 50–54°C setpoint', typeClass: 'node-input' } },

  { id: 'e101', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b1', extent: 'parent', data: { title: 'Condenser', subtitle: 'Reflux', hoverDetails: '<b>Tag:</b> E-101<br/><b>Type:</b> Vertical shell &amp; tube exchanger on the vapor nozzle <sup>[6]</sup><br/><b>How:</b> Cooling water in the shell condenses boiling toluene and gravity-returns it to R-101, so solvent isn&rsquo;t lost and the mass balance holds through reflux.<br/><b>Spec:</b> maintains reflux at 50–54°C', typeClass: 'node-unitOp' } },
  { id: 'ds_trap', type: 'custom', position: { x: 350, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Separator', subtitle: 'Azeotropic Decanter', hoverDetails: '<b>Type:</b> Condensate phase separator<br/><b>Duty:</b> Separate condensed water from the toluene reflux loop and return the organic phase to the reactor. Use only where required by the approved process description.', typeClass: 'node-unitOp' } },
  { id: 'waste_water', type: 'custom', position: { x: 150, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Separated Water', subtitle: 'Aqueous Waste', hoverDetails: '<b>Type:</b> Water-rich decanter phase<br/><b>Disposition:</b> Segregate and route to the approved aqueous-waste treatment path after characterization.', typeClass: 'node-waste' } },

  { id: 'r101', type: 'custom', position: { x: 550, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Complexation STR', subtitle: 'Reactor', hoverDetails: '<b>Tag:</b> R-101 <sup>[4]</sup><br/><b>Type:</b> Jacketed glass-lined STR (GLR) <sup>[5]</sup><br/><b>How:</b> The glass lining blocks metal-ion pickup (metals would wreck the Block 2 peroxide); VFD agitator M-101 keeps the 6.2 kg solid suspended while reflux + TIC-101 hold 50–54°C for ~50 min to build the dinuclear Ti complex. PSE-101 disc / PRV-101 relief protect it. <sup>[8]</sup><br/><b>Spec:</b> 45–50 min, 50–54°C <sup>[1]</sup>', typeClass: 'node-unitOp' } },
  { id: 'qc_port', type: 'custom', position: { x: 800, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'QC Sampling', subtitle: 'Moisture / Appearance Check', hoverDetails: '<b>Type:</b> In-process sample point<br/><b>Duty:</b> Collect a representative sample for the approved moisture and appearance checks before the batch proceeds. Acceptance criteria belong in the batch record and specification.', typeClass: 'node-unitOp' } },
  { id: 'vent', type: 'custom', position: { x: 1050, y: 300 }, parentId: 'b1', extent: 'parent', data: { title: 'Vent System', subtitle: 'Pressure Relief', hoverDetails: '<b>Type:</b> Relief header + knock-out drum <sup>[8]</sup><br/><b>How:</b> Normal displaced gas leaves through PCV-101; on overpressure PRV-101 and rupture disc PSE-101 blow to a knock-out drum that traps liquid before the safe vent.<br/><b>Route:</b> safe vent', typeClass: 'node-waste' } },

  { id: 'cool_phase', type: 'custom', position: { x: 550, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Cooling Phase', subtitle: 'Equilibration', hoverDetails: '<b>Type:</b> In-reactor cooldown step<br/><b>How:</b> TIC-101 switches the jacket to chilled water via TCV-102, dropping the batch 54°C &rarr; 25°C so the complex is stable and the next (exothermic) sulfoxidation stays controllable.<br/><b>Spec:</b> 54°C &rarr; 25°C <sup>[1, 10]</sup>', typeClass: 'node-unitOp' } },

  { id: 'b1_out', type: 'custom', position: { x: 550, y: 700 }, parentId: 'b1', extent: 'parent', data: { title: 'Active Ti-Complex', subtitle: 'Intermediate', hoverDetails: '<b>Type:</b> Intermediate stream &rarr; R-102<br/><b>How:</b> Cooled homogeneous suspension is transferred under N&#8322; to Block 2, carrying the active catalyst into the sulfoxidation.<br/><b>Spec:</b> dinuclear Ti-pyrmetazole complex in 25 L toluene <sup>[1]</sup>', typeClass: 'node-product' } },

  // Block 2 Nodes
  { id: 'v102a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b2', extent: 'parent', data: { title: 'Oxidant Vessel', subtitle: 'Cumene Hydroperoxide', hoverDetails: '<b>Tag:</b> V-102A<br/><b>Type:</b> Qualified CHP charge vessel<br/><b>Duty:</b> Hold and transfer the hydroperoxide oxidant to the controlled dosing point. Assay, carrier, and charge are defined by the material CoA and batch record.', typeClass: 'node-input' } },
  { id: 'p102', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b2', extent: 'parent', data: { title: 'Dosing Pump', subtitle: 'Controlled Flow', hoverDetails: '<b>Tag:</b> P-102<br/><b>Type:</b> High-precision metering pump<br/><b>How:</b> Trickles CHP in over ~1 hr so reaction heat is released gradually and the jacket can keep pace — a fast charge would run the exotherm away.<br/><b>Spec:</b> ~1 hr metered addition <sup>[5]</sup>', typeClass: 'node-unitOp' } },
  { id: 'util_cool', type: 'custom', position: { x: 50, y: 250 }, parentId: 'b2', extent: 'parent', data: { title: 'Chilled Water', subtitle: 'Max Cooling', hoverDetails: '<b>Loop:</b> TIC-102 <sup>[7]</sup><br/><b>Type:</b> Jacket chilled-water utility<br/><b>How:</b> TT-102 drives TCV-102 to flood the jacket with chilled water, soaking up the large heat of reaction and pinning the batch at 30°C.<br/><b>Spec:</b> absorbs ΔH ≈ -250 to -350 kJ/mol <sup>[2]</sup>', typeClass: 'node-input' } },
  { id: 'r102', type: 'custom', position: { x: 250, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Oxidation STR', subtitle: 'Asymmetric Sulfoxidation', hoverDetails: '<b>Tag:</b> R-102<br/><b>Type:</b> Jacketed stirred-tank reactor<br/><b>Duty:</b> Contact the activated titanium complex with CHP to oxidize the sulfide to the S-sulfoxide. Temperature, addition rate, and endpoint are controlled by the approved batch record. <sup>[1]</sup>', typeClass: 'node-unitOp' } },
  { id: 'b2_out', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Crude Reaction Mixture', subtitle: 'S-Sulfoxide in Process Solvent', hoverDetails: '<b>Type:</b> Unpurified reaction output<br/><b>Contains:</b> Product sulfoxide with solvent, catalyst-derived species, unreacted material, and oxidation by-products; transfers to Block 3 extraction.', typeClass: 'node-product' } },

  // Block 3 Nodes — source route continues through isolated sodium salt
  { id: 'v104a', type: 'custom', position: { x: 30, y: 120 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous Ammonia', subtitle: 'Extraction Feed', hoverDetails: '<b>Type:</b> Aqueous ammonia supply<br/><b>Duty:</b> Repeated liquid-liquid contacts transfer esomeprazole into the aqueous phase. Charge details remain controlled by the batch record. <sup>[1, 3]</sup>', typeClass: 'node-input' } },
  { id: 'ex101', type: 'custom', position: { x: 260, y: 180 }, parentId: 'b3', extent: 'parent', data: { title: 'Batch Extractor', subtitle: 'Three Ammonia Contacts', hoverDetails: '<b>Tag:</b> EX-101<br/><b>Type:</b> Agitated extraction/settling vessel<br/><b>Duty:</b> Contact, settle, phase-cut, and combine the aqueous product extracts. <sup>[1, 3]</sup>', typeClass: 'node-unitOp' } },
  { id: 'w_tol', type: 'custom', position: { x: 260, y: 40 }, parentId: 'b3', extent: 'parent', data: { title: 'Organic Raffinate', subtitle: 'Solvent Recovery / Waste', hoverDetails: '<b>Type:</b> Depleted organic phase<br/><b>Contains:</b> Toluene, spent catalyst, and organic impurities; disposition requires site waste characterization.', typeClass: 'node-waste' } },
  { id: 'aq_hold', type: 'custom', position: { x: 500, y: 180 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous Extract Receiver', subtitle: 'Combined Product Extracts', hoverDetails: '<b>Tag:</b> V-103A<br/><b>Duty:</b> Combine and homogenize the aqueous product-bearing phases before acidification and back-extraction.', typeClass: 'node-unitOp' } },
  { id: 'v104c', type: 'custom', position: { x: 500, y: 40 }, parentId: 'b3', extent: 'parent', data: { title: 'Acetic Acid', subtitle: 'Acidification Feed', hoverDetails: '<b>Type:</b> Metered acid supply<br/><b>Duty:</b> Adjust the aqueous extract for transfer of free esomeprazole into MIBK. Endpoint and charge are batch-record controls. <sup>[1, 3]</sup>', typeClass: 'node-input' } },
  { id: 'v104b', type: 'custom', position: { x: 500, y: 330 }, parentId: 'b3', extent: 'parent', data: { title: 'MIBK', subtitle: 'Back-Extraction Solvent', hoverDetails: '<b>Type:</b> Solvent supply<br/><b>Duty:</b> Two source-reported product extractions; the recovered organic phases are combined. <sup>[1]</sup>', typeClass: 'node-input' } },
  { id: 'ex102', type: 'custom', position: { x: 740, y: 180 }, parentId: 'b3', extent: 'parent', data: { title: 'Back Extractor', subtitle: 'Acidify / Extract / Separate', hoverDetails: '<b>Tag:</b> EX-102<br/><b>Type:</b> Agitated extraction/settling vessel<br/><b>Duty:</b> Acidification followed by repeated MIBK extraction and controlled phase separation. <sup>[1, 3]</sup>', typeClass: 'node-unitOp' } },
  { id: 'w_aq', type: 'custom', position: { x: 740, y: 330 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous Raffinate', subtitle: 'Effluent Treatment', hoverDetails: '<b>Type:</b> Product-depleted aqueous phase<br/><b>Disposition:</b> Characterize and route through the site aqueous-waste system.', typeClass: 'node-waste' } },
  { id: 'org_hold', type: 'custom', position: { x: 970, y: 180 }, parentId: 'b3', extent: 'parent', data: { title: 'Combined MIBK Receiver', subtitle: 'Free-Base Solution', hoverDetails: '<b>Tag:</b> V-103B<br/><b>Duty:</b> Combine the source-reported MIBK product extracts before sodium-salt formation. <sup>[1]</sup>', typeClass: 'node-unitOp' } },
  { id: 'v_naoh', type: 'custom', position: { x: 970, y: 40 }, parentId: 'b3', extent: 'parent', data: { title: 'Sodium Hydroxide', subtitle: 'Salt-Formation Feed', hoverDetails: '<b>Type:</b> Qualified caustic solution supply<br/><b>Duty:</b> Form esomeprazole sodium. Assay correction and charge are controlled from the material CoA and batch record. <sup>[1, 3]</sup>', typeClass: 'node-input' } },
  { id: 'v_acn', type: 'custom', position: { x: 970, y: 330 }, parentId: 'b3', extent: 'parent', data: { title: 'Acetonitrile', subtitle: 'Crystallization Solvent', hoverDetails: '<b>Type:</b> Qualified solvent supply<br/><b>Duty:</b> Provide the source-route medium for sodium-salt formation and isolation. <sup>[1, 3]</sup>', typeClass: 'node-input' } },
  { id: 'r103', type: 'custom', position: { x: 1170, y: 180 }, parentId: 'b3', extent: 'parent', data: { title: 'Salt Formation / Crystallizer', subtitle: 'NaOH + Acetonitrile', hoverDetails: '<b>Tag:</b> R-103<br/><b>Type:</b> Agitated, temperature-controlled vessel with concentration capability<br/><b>Duty:</b> Form the sodium salt, concentrate as required, and develop an isolable slurry. Detailed endpoint and isolation conditions require the approved batch record. <sup>[1, 3]</sup>', typeClass: 'node-unitOp' } },
  { id: 'f103', type: 'custom', position: { x: 1170, y: 500 }, parentId: 'b3', extent: 'parent', data: { title: 'Sodium-Salt Filter', subtitle: 'Solid / Liquid Isolation', hoverDetails: '<b>Tag:</b> F-103<br/><b>Type:</b> Contained filter<br/><b>Duty:</b> Isolate the crystalline sodium salt and separate its mother liquor. <sup>[1, 3]</sup>', typeClass: 'node-unitOp' } },
  { id: 'w_cond', type: 'custom', position: { x: 1170, y: 40 }, parentId: 'b3', extent: 'parent', data: { title: 'Concentrator Condensate', subtitle: 'Solvent Recovery', hoverDetails: '<b>Type:</b> Condensed overheads<br/><b>Disposition:</b> Segregate from filtration mother liquor and route after composition confirmation.', typeClass: 'node-waste' } },
  { id: 'w_ml3', type: 'custom', position: { x: 950, y: 650 }, parentId: 'b3', extent: 'parent', data: { title: 'Sodium-Salt Mother Liquor', subtitle: 'Waste / Recovery', hoverDetails: '<b>Type:</b> Filtration mother liquor<br/><b>Disposition:</b> Route after solvent and residual-API characterization.', typeClass: 'node-waste' } },
  { id: 'b3_out', type: 'custom', position: { x: 1200, y: 650 }, parentId: 'b3', extent: 'parent', data: { title: 'Isolated Esomeprazole Sodium', subtitle: 'Controlled Solid Handoff', hoverDetails: '<b>Type:</b> Isolated intermediate<br/><b>Handoff:</b> Transfer by reconciled mass, assay, water/volatile basis, identity, and residual-solvent data to Block 4. <sup>[1, 3]</sup>', typeClass: 'node-product' } },

  // Block 4 Nodes — direct aqueous sodium-to-magnesium conversion
  { id: 'v_water4', type: 'custom', position: { x: 40, y: 100 }, parentId: 'b4', extent: 'parent', data: { title: 'Purified Water', subtitle: 'Reconstitution Medium', hoverDetails: '<b>Type:</b> Qualified water supply<br/><b>Duty:</b> Reconstitute the isolated sodium salt for the aqueous magnesium precipitation step.', typeClass: 'node-input' } },
  { id: 'r104', type: 'custom', position: { x: 290, y: 220 }, parentId: 'b4', extent: 'parent', data: { title: 'Dissolution / Precipitation Reactor', subtitle: 'Sodium Salt → Magnesium Salt', hoverDetails: '<b>Tag:</b> R-104<br/><b>Type:</b> Agitated, temperature-controlled aqueous reactor<br/><b>Duty:</b> Dissolve/reconstitute the sodium salt, dose magnesium chloride, precipitate, and age the magnesium salt. Phase-form claims remain provisional until representative solid-state testing. <sup>[4]</sup>', typeClass: 'node-unitOp' } },
  { id: 'v_mgcl2', type: 'custom', position: { x: 290, y: 60 }, parentId: 'b4', extent: 'parent', data: { title: 'Magnesium Chloride', subtitle: 'Aqueous Dose', hoverDetails: '<b>Type:</b> MgCl&#8322;&middot;6H&#8322;O solution preparation/dosing<br/><b>Duty:</b> Supply magnesium ion to precipitate the magnesium salt. Charge is calculated on a defined assay and hydration basis. <sup>[4]</sup>', typeClass: 'node-input' } },
  { id: 'f104', type: 'custom', position: { x: 540, y: 220 }, parentId: 'b4', extent: 'parent', data: { title: 'Filter / Water Wash', subtitle: 'Wet-Cake Isolation', hoverDetails: '<b>Tag:</b> F-104<br/><b>Type:</b> Contained filter or ANF<br/><b>Duty:</b> Isolate the precipitated magnesium salt and water-wash the cake before its controlled wet transfer.', typeClass: 'node-unitOp' } },
  { id: 'w_ml4', type: 'custom', position: { x: 540, y: 430 }, parentId: 'b4', extent: 'parent', data: { title: 'Aqueous Filtrate / Washes', subtitle: 'Effluent Treatment', hoverDetails: '<b>Type:</b> Mother liquor and wash filtrate<br/><b>Disposition:</b> Characterize for salts and residual API before site treatment.', typeClass: 'node-waste' } },
  { id: 'b4_out', type: 'custom', position: { x: 730, y: 220 }, parentId: 'b4', extent: 'parent', data: { title: 'Washed Magnesium-Salt Wet Cake', subtitle: 'Provisional Solid Form', hoverDetails: '<b>Type:</b> Controlled wet-cake handoff<br/><b>Handoff:</b> Record wet mass, solids/assay basis, residual salts, and representative solid-state result. Do not assign trihydrate solely from route history. <sup>[4, 5]</sup>', typeClass: 'node-product' } },

  // Block 5 Nodes — no separate acetone crystallizer
  { id: 'qc105', type: 'custom', position: { x: 40, y: 180 }, parentId: 'b5', extent: 'parent', data: { title: 'Representative Solid-State Check', subtitle: 'Identity / Hydrate Disposition', hoverDetails: '<b>Type:</b> Representative sampling and laboratory disposition<br/><b>Duty:</b> Compare an appropriately prepared sample with the qualified solid-form reference before final release claims. <sup>[5]</sup>', typeClass: 'node-unitOp' } },
  { id: 'v_water5', type: 'custom', position: { x: 290, y: 40 }, parentId: 'b5', extent: 'parent', data: { title: 'Purified Water', subtitle: 'Optional Reslurry', hoverDetails: '<b>Type:</b> Qualified water supply<br/><b>Duty:</b> Used only when purge or solid-form data require water elutriation/reslurry; this is not an automatic fixed wash. <sup>[5]</sup>', typeClass: 'node-input' } },
  { id: 'f105', type: 'custom', position: { x: 290, y: 180 }, parentId: 'b5', extent: 'parent', data: { title: 'ANFD', subtitle: 'Optional Reslurry / Refilter / Vacuum Dry', hoverDetails: '<b>Tag:</b> F-105<br/><b>Type:</b> Contained agitated nutsche filter dryer<br/><b>Duty:</b> If required, water-reslurry and refilter the wet cake; then vacuum-dry under a qualified cycle that preserves the accepted solid form. <sup>[5]</sup>', typeClass: 'node-unitOp' } },
  { id: 'w_ml2', type: 'custom', position: { x: 290, y: 380 }, parentId: 'b5', extent: 'parent', data: { title: 'Filtrate / Drying Condensate', subtitle: 'Waste / Recovery', hoverDetails: '<b>Type:</b> Optional reslurry filtrate plus segregated dryer condensate<br/><b>Disposition:</b> Route by measured composition.', typeClass: 'node-waste' } },
  { id: 'm105', type: 'custom', position: { x: 560, y: 180 }, parentId: 'b5', extent: 'parent', data: { title: 'Mill / Sieve', subtitle: 'Qualified Particle Sizing', hoverDetails: '<b>Tag:</b> M-105<br/><b>Type:</b> Contained delumping or milling system<br/><b>Duty:</b> Condition the dried material to the approved particle-size specification without changing its accepted solid form.', typeClass: 'node-unitOp' } },
  { id: 'out', type: 'custom', position: { x: 750, y: 180 }, parentId: 'b5', extent: 'parent', data: { title: 'Released Esomeprazole Magnesium API', subtitle: 'Test / Package', hoverDetails: '<b>Type:</b> Final packaged API<br/><b>Release:</b> Identity, assay, water/solid form, residual solvents, impurities, and particle size are controlled by the approved specification.', typeClass: 'node-product' } },
];

const initialEdges = [
  // Block 1 Edges — each stream labelled with what it carries
  { id: 'e-v101a-r101', source: 'v101a', target: 'r101', type: 'step', label: 'Toluene 25 L · FCV-101' },
  { id: 'e-v101b-r101', source: 'v101b', target: 'r101', type: 'step', label: 'Pyrmetazole 6.2 kg (solid)' },
  { id: 'e-amine-r101', source: 'amine_in', target: 'r101', type: 'step', label: 'DIPEA base 0.72 kg' },
  { id: 'e-det-r101', source: 'det_in', target: 'r101', type: 'step', label: '(S,S)-DET 2.35 kg · XV-102' },
  { id: 'e-w-p101', source: 'w_src', target: 'p101', type: 'step', label: 'Water 44 mL' },
  { id: 'e-p101-r101', source: 'p101', target: 'r101', type: 'step', label: 'Metered H₂O (sub-surface)' },
  { id: 'e-v101c-r101', source: 'v101c', target: 'r101', type: 'step', label: 'Ti(OiPr)₄ 1.60 kg · XV-103' },
  { id: 'e-n2-r101', source: 'n2_in', target: 'r101', type: 'step', label: 'N₂ purge · XV-101' },

  // Azeotropic distillation loop
  { id: 'e-r101-e101', source: 'r101', target: 'e101', label: 'Toluene vapor' },
  { id: 'e-e101-ds', source: 'e101', target: 'ds_trap', type: 'step', label: 'Toluene/water condensate' },
  { id: 'e-ds-r101', source: 'ds_trap', target: 'r101', type: 'step', label: 'Dry toluene reflux' },
  { id: 'e-ds-waste', source: 'ds_trap', target: 'waste_water', type: 'step', className: 'waste-edge', label: 'Separated water' },

  { id: 'e-r101-qc', source: 'r101', target: 'qc_port', label: 'KF sample' },
  { id: 'e-r101-vent', source: 'r101', target: 'vent', type: 'step', label: 'Displaced N₂/air · PCV-101' },
  { id: 'e-util-r101', source: 'util_in', target: 'r101', type: 'step', label: 'Jacket heat/cool · TCV-101/102' },
  { id: 'e-r101-cool', source: 'r101', target: 'cool_phase', type: 'step', label: 'Ti-complex 50→25°C' },
  { id: 'e-cool-b1', source: 'cool_phase', target: 'b1_out', type: 'step', label: 'Ti-complex in 25 L toluene' },

  // B2
  { id: 'e-v102a-p102', source: 'v102a', target: 'p102', type: 'step', label: 'CHP 3.30 kg (oxidant)' },
  { id: 'e-p102-r102', source: 'p102', target: 'r102', type: 'step', label: 'CHP metered over 1 hr' },
  { id: 'e-b1-r102', source: 'b1_out', target: 'r102', type: 'step', label: 'Ti-complex + substrate' },
  { id: 'e-util-r102', source: 'util_cool', target: 'r102', type: 'step', label: 'Chilled water · TCV-102' },
  { id: 'e-r102-b2', source: 'r102', target: 'b2_out', type: 'step', label: 'Crude S-sulfoxide (ee >94%)' },

  // B3
  { id: 'e-b2-ex101', source: 'b2_out', target: 'ex101', type: 'step', label: 'Crude in toluene' },
  { id: 'e-v104a-ex101', source: 'v104a', target: 'ex101', type: 'step', label: 'Aqueous ammonia contacts' },
  { id: 'e-ex101-w_tol', source: 'ex101', target: 'w_tol', type: 'step', className: 'waste-edge', label: 'Depleted organic raffinate' },
  { id: 'e-ex101-aq', source: 'ex101', target: 'aq_hold', type: 'step', label: 'Combined aqueous extracts' },
  { id: 'e-aq-ex102', source: 'aq_hold', target: 'ex102', type: 'step', label: 'Product-bearing aqueous phase' },
  { id: 'e-v104c-ex102', source: 'v104c', target: 'ex102', type: 'step', label: 'Acetic acid to endpoint' },
  { id: 'e-v104b-ex102', source: 'v104b', target: 'ex102', type: 'step', label: 'MIBK extraction contacts' },
  { id: 'e-ex102-w_aq', source: 'ex102', target: 'w_aq', type: 'step', className: 'waste-edge', label: 'Aqueous raffinate' },
  { id: 'e-ex102-org', source: 'ex102', target: 'org_hold', type: 'step', label: 'Combined MIBK extracts' },
  { id: 'e-org-r103', source: 'org_hold', target: 'r103', type: 'step', label: 'Free-base solution' },
  { id: 'e-naoh-r103', source: 'v_naoh', target: 'r103', type: 'step', label: 'Qualified NaOH solution' },
  { id: 'e-acn-r103', source: 'v_acn', target: 'r103', type: 'step', label: 'Acetonitrile' },
  { id: 'e-r103-cond', source: 'r103', target: 'w_cond', type: 'step', className: 'waste-edge', label: 'Concentrator condensate' },
  { id: 'e-r103-f103', source: 'r103', target: 'f103', type: 'step', label: 'Sodium-salt slurry' },
  { id: 'e-f103-wml3', source: 'f103', target: 'w_ml3', type: 'step', className: 'waste-edge', label: 'Filtration mother liquor' },
  { id: 'e-f103-b3', source: 'f103', target: 'b3_out', type: 'step', label: 'Isolated sodium salt' },

  // B4
  { id: 'e-b3-r104', source: 'b3_out', target: 'r104', type: 'step', label: 'Reconciled sodium-salt solid' },
  { id: 'e-water4-r104', source: 'v_water4', target: 'r104', type: 'step', label: 'Purified water' },
  { id: 'e-mgcl2-r104', source: 'v_mgcl2', target: 'r104', type: 'step', label: 'Aqueous MgCl₂·6H₂O dose' },
  { id: 'e-r104-f104', source: 'r104', target: 'f104', type: 'step', label: 'Aged magnesium-salt slurry' },
  { id: 'e-f104-wml4', source: 'f104', target: 'w_ml4', type: 'step', className: 'waste-edge', label: 'Mother liquor + water washes' },
  { id: 'e-f104-b4', source: 'f104', target: 'b4_out', type: 'step', label: 'Washed wet cake' },

  // B5
  { id: 'e-b4-qc105', source: 'b4_out', target: 'qc105', type: 'step', label: 'Representative wet cake' },
  { id: 'e-qc105-f105', source: 'qc105', target: 'f105', type: 'step', label: 'Dispositioned wet cake' },
  { id: 'e-water5-f105', source: 'v_water5', target: 'f105', type: 'step', label: 'Optional water reslurry' },
  { id: 'e-f105-w_ml2', source: 'f105', target: 'w_ml2', type: 'step', className: 'waste-edge', label: 'Filtrate / drying condensate' },
  { id: 'e-f105-m105', source: 'f105', target: 'm105', type: 'step', label: 'Qualified dry cake' },
  { id: 'e-m105-out', source: 'm105', target: 'out', type: 'step', label: 'Milled / sieved API' },
];

// Use a consistent rounded orthogonal route for every stream. This keeps long
// utility/feed runs readable while preserving the editable endpoints.
const routedEdges = initialEdges.map((edge) => ({
  ...edge,
  type: 'smoothstep',
  pathOptions: { borderRadius: 18, offset: 22 },
}));

// Approximate per-batch stream / material balance (scoping figures — see note).
// Liquid volumes converted at nominal densities: toluene 0.87, MIBK 0.80, aq. NH3 0.95 kg/L.
const massBalance = [
  { block: 'Block 1 — Catalyst Complexation', rows: [
    { dir: 'in',    stream: 'Toluene (solvent)',           comp: 'C7H8',            amt: '25 L ≈ 21.7 kg' },
    { dir: 'in',    stream: 'Pyrmetazole (substrate)',     comp: 'C17H19N3O2S',     amt: '6.2 kg / 18.8 mol' },
    { dir: 'in',    stream: 'DIPEA (base/buffer)',         comp: '(iPr)2NEt',       amt: '0.72 kg' },
    { dir: 'in',    stream: '(S,S)-DET (ligand)',          comp: 'C8H14O6',         amt: '2.35 kg / 11.4 mol' },
    { dir: 'in',    stream: 'Water (activator)',           comp: 'H2O',             amt: '0.044 kg / 2.4 mol' },
    { dir: 'in',    stream: 'Ti(OiPr)4 (catalyst)',        comp: 'Ti(OC3H7)4',      amt: '1.60 kg / 5.6 mol' },
    { dir: 'out',   stream: 'Ti-complex solution → B2',    comp: 'complex in toluene', amt: '≈ 32.6 kg' },
    { dir: 'waste', stream: 'Separated water (Dean-Stark)', comp: 'H2O',            amt: 'trace (est.)' },
    { dir: 'waste', stream: 'Vent',                        comp: 'N2 / air',        amt: 'gas' },
  ]},
  { block: 'Block 2 — Asymmetric Sulfoxidation', rows: [
    { dir: 'in',    stream: 'Ti-complex solution (from B1)', comp: 'complex in toluene', amt: '≈ 32.6 kg' },
    { dir: 'in',    stream: 'Cumene hydroperoxide (CHP)',  comp: 'C9H12O2',         amt: '3.30 kg / ~21.7 mol' },
    { dir: 'out',   stream: 'Crude esomeprazole → B3',     comp: 'product + cumyl alcohol + unreacted + Ti + toluene', amt: '≈ 35.9 kg (API ~6.5 kg est.)' },
  ]},
  { block: 'Block 3 — Extraction, Sodium-Salt Formation & Isolation', rows: [
    { dir: 'in',    stream: 'Crude stream (from B2)',      comp: 'crude sulfoxide in toluene', amt: 'Batch record / transfer record' },
    { dir: 'in',    stream: 'Aqueous ammonia',             comp: 'NH3 / H2O',       amt: 'Batch record' },
    { dir: 'in',    stream: 'MIBK and acetic acid',        comp: 'extraction solvent / acidification feed', amt: 'Batch record' },
    { dir: 'in',    stream: 'NaOH solution and acetonitrile', comp: 'salt-forming reagent / solvent', amt: 'CoA-corrected batch record' },
    { dir: 'out',   stream: 'Isolated esomeprazole sodium → B4', comp: 'solid sodium salt', amt: 'Reconciled assay-basis handoff' },
    { dir: 'waste', stream: 'Organic and aqueous raffinates', comp: 'spent process phases', amt: 'Measured / reconciled' },
    { dir: 'waste', stream: 'Condensate and mother liquor', comp: 'process solvents + residuals', amt: 'Measured / reconciled' },
  ]},
  { block: 'Block 4 — Aqueous Magnesium-Salt Precipitation', rows: [
    { dir: 'in',    stream: 'Isolated sodium salt (from B3)', comp: 'esomeprazole sodium', amt: 'Assay-basis transfer record' },
    { dir: 'in',    stream: 'Purified water',              comp: 'H2O',             amt: 'Batch record' },
    { dir: 'in',    stream: 'Magnesium chloride hexahydrate', comp: 'MgCl2·6H2O',   amt: 'Defined assay/hydration basis' },
    { dir: 'out',   stream: 'Washed Mg-salt wet cake → B5', comp: 'provisional magnesium-salt solid form', amt: 'Wet mass + solids/assay basis' },
    { dir: 'waste', stream: 'Aqueous filtrate and washes', comp: 'water + dissolved salts + residual API', amt: 'Measured / reconciled' },
  ]},
  { block: 'Block 5 — Wet-Cake Conditioning, Drying & Packaging', rows: [
    { dir: 'in',    stream: 'Washed wet cake (from B4)',   comp: 'esomeprazole magnesium wet cake', amt: 'Controlled transfer record' },
    { dir: 'in',    stream: 'Purified water (optional)',   comp: 'H2O',             amt: 'Only if purge/form data require reslurry' },
    { dir: 'out',   stream: 'Released API',                comp: 'specification-compliant esomeprazole magnesium', amt: 'Final release result' },
    { dir: 'waste', stream: 'Optional filtrate / drying condensate', comp: 'water + removed volatiles', amt: 'Measured / reconciled' },
  ]},
];

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(routedEdges);
  const [showRefs, setShowRefs] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onReconnect = useCallback(
    (oldEdge, newConnection) => setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds)),
    [setEdges],
  );

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
              <li>[2] Reserved: no secondary scale-up source is used to define the revised topology.</li>
            </ul>
            <strong>Patents</strong>
            <ul>
              <li>[3] US Patent 5,948,789, Example 11. Asymmetric oxidation, extraction, and isolated esomeprazole sodium.</li>
              <li>[4] US Patent 8,106,210 B2, Reference Example 2 (direct pre-grant: US 2010/0227890 A1). Aqueous magnesium-chloride precipitation.</li>
              <li>[5] US Patent 6,369,085 B1, Example 7. Water elutriation and vacuum-drying precedent for the trihydrate.</li>
            </ul>
            <strong>Engineering Design & Handbooks</strong>
            <ul>
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

        <button className="ref-button balance-button" onClick={() => setShowBalance(!showBalance)}>
          ⚖️ Mass Balance {showBalance ? '▲' : '▼'}
        </button>
        {showBalance && (
          <div className="balance-dropdown">
            {massBalance.map((b) => (
              <div key={b.block}>
                <h4>{b.block}</h4>
                <table className="balance-table">
                  <thead>
                    <tr><th>Dir</th><th>Stream</th><th>Components</th><th>Approx amount</th></tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, i) => (
                      <tr key={i} className={`balance-${r.dir}`}>
                        <td className="dir-cell">{r.dir === 'in' ? 'In' : r.dir === 'out' ? 'Out' : 'Waste'}</td>
                        <td>{r.stream}</td>
                        <td>{r.comp}</td>
                        <td className="amt">{r.amt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="balance-note">
              Blocks 3–5 are shown on a unit-operation basis only. Their quantities must
              come from reconciled transfer records, qualified material CoAs, and approved
              batch instructions; the PFD does not establish equipment sizing or operating setpoints.
            </div>
          </div>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        edgesReconnectable
        edgesFocusable
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
