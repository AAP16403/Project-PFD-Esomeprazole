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
  { id: 'v101a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solvent Vessel', subtitle: 'Toluene', hoverDetails: '<b>Tag:</b> V-101A <sup>[4]</sup><br/><b>Type:</b> Toluene charge vessel &rarr; R-101<br/><b>How:</b> FT-101 Coriolis meter totalizes mass flow to the DCS, which snaps FCV-101 shut the instant 25 L is reached — the charge is exact no matter how the pump drifts.<br/><b>Spec:</b> 25 L toluene (reaction solvent) <sup>[7, 10]</sup>', typeClass: 'node-input' } },
  { id: 'v101b', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Solid Hopper', subtitle: 'Pyrmetazole', hoverDetails: '<b>Tag:</b> V-101B <sup>[4]</sup><br/><b>Type:</b> Solid charge hopper<br/><b>How:</b> A rotary airlock turns the solid in through sealed pockets, metering it into the stirred toluene without ever opening the vessel to air (keeps the N&#8322; blanket intact).<br/><b>Spec:</b> 6.2 kg pyrmetazole (18.8 mol) <sup>[1, 10]</sup>', typeClass: 'node-input' } },
  { id: 'amine_in', type: 'custom', position: { x: 450, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Base Supply', subtitle: 'Amine', hoverDetails: '<b>Type:</b> DIPEA base charge (metered liquid)<br/><b>How:</b> The tertiary amine mops up trace acid so the titanium&ndash;tartrate complex can&rsquo;t acid-decompose, and buffers the batch pH steady.<br/><b>Spec:</b> 0.72 kg DIPEA ((iPr)&#8322;NEt) <sup>[1, 10]</sup>', typeClass: 'node-input' } },
  { id: 'det_in', type: 'custom', position: { x: 650, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Ligand Supply', subtitle: '(S,S)-DET', hoverDetails: '<b>Type:</b> Chiral ligand charge via XV-102<br/><b>How:</b> XV-102 opens once at temperature; the tartrate chelates titanium and its (S,S) handedness is what forces the S-sulfoxide downstream — this is the step that makes the drug &ldquo;eso&rdquo;.<br/><b>Spec:</b> 2.35 kg (11.4 mol) (S,S)-diethyl tartrate <sup>[1]</sup>', typeClass: 'node-input' } },
  { id: 'w_src', type: 'custom', position: { x: 850, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Supply', subtitle: 'Ultra-Pure', hoverDetails: '<b>Type:</b> Ultra-pure water micro-charge<br/><b>How:</b> Dosed through hair-bore capillary straight into the liquid so none is lost to pipe dead-legs; the water stoichiometrically activates the Ti complex — too much would hydrolyze it.<br/><b>Spec:</b> exactly 44 mL water (2.4 mol) <sup>[1, 10]</sup>', typeClass: 'node-input' } },
  { id: 'p101', type: 'custom', position: { x: 850, y: 150 }, parentId: 'b1', extent: 'parent', data: { title: 'Micro-Pump', subtitle: 'Dosing', hoverDetails: '<b>Tag:</b> P-101<br/><b>Type:</b> Positive-displacement metering pump<br/><b>How:</b> Each stroke delivers a fixed micro-volume, so stroke count sets the dose to within drops — that is how 44 mL is hit accurately at plant scale.<br/><b>Spec:</b> injects the 44 mL water charge <sup>[4, 7]</sup>', typeClass: 'node-unitOp' } },
  { id: 'v101c', type: 'custom', position: { x: 1050, y: 50 }, parentId: 'b1', extent: 'parent', data: { title: 'Dosing Vessel', subtitle: 'Titanium Source', hoverDetails: '<b>Tag:</b> V-101C<br/><b>Type:</b> Inerted micro-dosing vessel<br/><b>How:</b> Air-sensitive Ti(OiPr)&#8324; is pushed under N&#8322; pressure through XV-103 down a dip-tube that discharges below the liquid line — no splashing onto dry walls where it would gel. <sup>[5]</sup><br/><b>Spec:</b> 1.60 kg Ti(OiPr)&#8324; (5.6 mol) <sup>[1, 10]</sup>', typeClass: 'node-input' } },

  { id: 'n2_in', type: 'custom', position: { x: 50, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Inert Gas', subtitle: 'Nitrogen', hoverDetails: '<b>Loop:</b> PIC-101 (inerting) <sup>[7]</sup><br/><b>Type:</b> N&#8322; purge / blanket<br/><b>How:</b> PT-101 watches headspace pressure; when it sags, XV-101 pulses N&#8322; in and PCV-101 bleeds off the displaced air, holding a slight positive pressure so air can never leak in and oxidize the catalyst.<br/><b>Spec:</b> ~1.1 bar positive', typeClass: 'node-input' } },
  { id: 'util_in', type: 'custom', position: { x: 50, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Utilities', subtitle: 'Heating/Cooling', hoverDetails: '<b>Loop:</b> TIC-101 (jacket) <sup>[7]</sup><br/><b>Type:</b> Reactor-jacket thermal utility<br/><b>How:</b> TT-101 (tantalum tip survives the process fluid) drives a PID that strokes TCV-101 to add hot water/LP steam or TCV-102 to add chilled water, holding the jacket so the bulk sits at setpoint.<br/><b>Spec:</b> 50–54°C setpoint', typeClass: 'node-input' } },

  { id: 'e101', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b1', extent: 'parent', data: { title: 'Condenser', subtitle: 'Reflux', hoverDetails: '<b>Tag:</b> E-101<br/><b>Type:</b> Vertical shell &amp; tube exchanger on the vapor nozzle <sup>[6]</sup><br/><b>How:</b> Cooling water in the shell condenses boiling toluene and gravity-returns it to R-101, so solvent isn&rsquo;t lost and the mass balance holds through reflux.<br/><b>Spec:</b> maintains reflux at 50–54°C', typeClass: 'node-unitOp' } },
  { id: 'ds_trap', type: 'custom', position: { x: 350, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Water Separator', subtitle: 'Azeotropic', hoverDetails: '<b>Type:</b> Dean-Stark decanter trap<br/><b>How:</b> The toluene&ndash;water azeotrope condenses into the trap and splits by density; water is drawn off the bottom and dry toluene overflows back — this dries the batch before the exact 44 mL dose. <sup>[1, 8]</sup><br/><b>Spec:</b> removes residual water', typeClass: 'node-unitOp' } },
  { id: 'waste_water', type: 'custom', position: { x: 150, y: 250 }, parentId: 'b1', extent: 'parent', data: { title: 'Waste', subtitle: 'Azeotrope H2O', hoverDetails: '<b>Type:</b> Water knock-out<br/><b>How:</b> The uncontrolled water separated by the Dean-Stark trap collects here and is discarded, so only the metered 44 mL water is left in play.<br/><b>Route:</b> to waste', typeClass: 'node-waste' } },

  { id: 'r101', type: 'custom', position: { x: 550, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'Complexation STR', subtitle: 'Reactor', hoverDetails: '<b>Tag:</b> R-101 <sup>[4]</sup><br/><b>Type:</b> Jacketed glass-lined STR (GLR) <sup>[5]</sup><br/><b>How:</b> The glass lining blocks metal-ion pickup (metals would wreck the Block 2 peroxide); VFD agitator M-101 keeps the 6.2 kg solid suspended while reflux + TIC-101 hold 50–54°C for ~50 min to build the dinuclear Ti complex. PSE-101 disc / PRV-101 relief protect it. <sup>[8]</sup><br/><b>Spec:</b> 45–50 min, 50–54°C <sup>[1]</sup>', typeClass: 'node-unitOp' } },
  { id: 'qc_port', type: 'custom', position: { x: 800, y: 400 }, parentId: 'b1', extent: 'parent', data: { title: 'QC Sampling', subtitle: 'Karl Fischer', hoverDetails: '<b>Type:</b> Karl Fischer sample port<br/><b>How:</b> A grab sample is KF-titrated (iodine consumed is proportional to water); titanium is charged only once moisture reads &lt; 0.05%, because any excess water would hydrolyze the catalyst.<br/><b>Spec:</b> gate — moisture &lt; 0.05% <sup>[2]</sup>', typeClass: 'node-unitOp' } },
  { id: 'vent', type: 'custom', position: { x: 1050, y: 300 }, parentId: 'b1', extent: 'parent', data: { title: 'Vent System', subtitle: 'Pressure Relief', hoverDetails: '<b>Type:</b> Relief header + knock-out drum <sup>[8]</sup><br/><b>How:</b> Normal displaced gas leaves through PCV-101; on overpressure PRV-101 and rupture disc PSE-101 blow to a knock-out drum that traps liquid before the safe vent.<br/><b>Route:</b> safe vent', typeClass: 'node-waste' } },

  { id: 'cool_phase', type: 'custom', position: { x: 550, y: 550 }, parentId: 'b1', extent: 'parent', data: { title: 'Cooling Phase', subtitle: 'Equilibration', hoverDetails: '<b>Type:</b> In-reactor cooldown step<br/><b>How:</b> TIC-101 switches the jacket to chilled water via TCV-102, dropping the batch 54°C &rarr; 25°C so the complex is stable and the next (exothermic) sulfoxidation stays controllable.<br/><b>Spec:</b> 54°C &rarr; 25°C <sup>[1, 10]</sup>', typeClass: 'node-unitOp' } },

  { id: 'b1_out', type: 'custom', position: { x: 550, y: 700 }, parentId: 'b1', extent: 'parent', data: { title: 'Active Ti-Complex', subtitle: 'Intermediate', hoverDetails: '<b>Type:</b> Intermediate stream &rarr; R-102<br/><b>How:</b> Cooled homogeneous suspension is transferred under N&#8322; to Block 2, carrying the active catalyst into the sulfoxidation.<br/><b>Spec:</b> dinuclear Ti-pyrmetazole complex in 25 L toluene <sup>[1]</sup>', typeClass: 'node-product' } },

  // Block 2 Nodes
  { id: 'v102a', type: 'custom', position: { x: 50, y: 50 }, parentId: 'b2', extent: 'parent', data: { title: 'Oxidant Vessel', subtitle: 'CHP', hoverDetails: '<b>Tag:</b> V-102A <sup>[4]</sup><br/><b>Type:</b> Cooled oxidant charge vessel<br/><b>How:</b> Holds thermally-sensitive CHP cold and isolated, feeding it only to P-102 so the oxidant is always added slowly and never dumped into the reactor.<br/><b>Spec:</b> 3.30 kg cumene hydroperoxide (CHP) <sup>[1, 8, 10]</sup>', typeClass: 'node-input' } },
  { id: 'p102', type: 'custom', position: { x: 250, y: 50 }, parentId: 'b2', extent: 'parent', data: { title: 'Dosing Pump', subtitle: 'Controlled Flow', hoverDetails: '<b>Tag:</b> P-102<br/><b>Type:</b> High-precision metering pump<br/><b>How:</b> Trickles CHP in over ~1 hr so reaction heat is released gradually and the jacket can keep pace — a fast charge would run the exotherm away.<br/><b>Spec:</b> ~1 hr metered addition <sup>[5]</sup>', typeClass: 'node-unitOp' } },
  { id: 'util_cool', type: 'custom', position: { x: 50, y: 250 }, parentId: 'b2', extent: 'parent', data: { title: 'Chilled Water', subtitle: 'Max Cooling', hoverDetails: '<b>Loop:</b> TIC-102 <sup>[7]</sup><br/><b>Type:</b> Jacket chilled-water utility<br/><b>How:</b> TT-102 drives TCV-102 to flood the jacket with chilled water, soaking up the large heat of reaction and pinning the batch at 30°C.<br/><b>Spec:</b> absorbs ΔH ≈ -250 to -350 kJ/mol <sup>[2]</sup>', typeClass: 'node-input' } },
  { id: 'r102', type: 'custom', position: { x: 250, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Oxidation STR', subtitle: 'Reaction Phase', hoverDetails: '<b>Tag:</b> R-102 (or Phase 2 of R-101) <sup>[4]</sup><br/><b>Type:</b> Jacketed GLR stirred-tank reactor<br/><b>How:</b> The chiral Ti complex steers CHP to oxidize the sulfide enantioselectively to the S-sulfoxide; TIC-102 holds 30°C and a high-temp alarm interlocks the dose, because overheating over-oxidizes to the sulfone impurity.<br/><b>Spec:</b> 30°C, ~1 hr <sup>[1, 8]</sup>', typeClass: 'node-unitOp' } },
  { id: 'b2_out', type: 'custom', position: { x: 550, y: 200 }, parentId: 'b2', extent: 'parent', data: { title: 'Crude Extract', subtitle: 'Crude Esomeprazole', hoverDetails: '<b>Type:</b> Crude product stream &rarr; EX-101<br/><b>How:</b> Reaction held and carried forward with its spent catalyst and solvent still in the mix, to be cleaned up by extraction in Block 3.<br/><b>Spec:</b> ee &gt; 94%; + unreacted pyrmetazole, Ti-complex, toluene <sup>[1, 10]</sup>', typeClass: 'node-product' } },

  // Block 3 Nodes
  { id: 'v104a', type: 'custom', position: { x: 30, y: 250 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous NH3', subtitle: '12.5%', hoverDetails: '<b>Tag:</b> V-104A<br/><b>Type:</b> Aqueous ammonia dosing tank<br/><b>How:</b> At high pH the ammonia strips the benzimidazole proton, turning esomeprazole into a water-soluble anion that migrates out of the toluene into the aqueous phase — leaving titanium and organics behind. Charged in 3&times;20 L portions.<br/><b>Spec:</b> 60 L 12.5% NH&#8323; <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'w_tol', type: 'custom', position: { x: 530, y: 250 }, parentId: 'b3', extent: 'parent', data: { title: 'Waste Toluene', subtitle: 'SRU', hoverDetails: '<b>Type:</b> Spent organic phase<br/><b>How:</b> The de-producted toluene, now carrying the degraded Ti catalyst, is drained off the top and routed to solvent recovery for reuse.<br/><b>Route:</b> &rarr; SRU <sup>[8]</sup>', typeClass: 'node-waste' } },
  { id: 'ex101', type: 'custom', position: { x: 270, y: 350 }, parentId: 'b3', extent: 'parent', data: { title: 'Primary Extractor', subtitle: 'Mixer-Settler', hoverDetails: '<b>Tag:</b> EX-101 <sup>[6]</sup><br/><b>Type:</b> Jacketed mixer-settler (GLR / SS316L), Rushton turbine<br/><b>How:</b> The turbine disperses the two liquids for high mass-transfer, then agitation stops for a gravity settle; LT-101 (optical / conductivity / radar) at the drain senses the toluene&harr;water interface and closes XV-105 the instant the heavy aqueous phase finishes draining — a sharp cut with no carry-over. <sup>[7]</sup><br/><b>Spec:</b> mix 15–30 min, then settle', typeClass: 'node-unitOp' } },

  { id: 'v104c', type: 'custom', position: { x: 30, y: 450 }, parentId: 'b3', extent: 'parent', data: { title: 'Acetic Acid', subtitle: 'pH Adjust', hoverDetails: '<b>Tag:</b> V-104C<br/><b>Type:</b> Acid dosing tank<br/><b>How:</b> Acetic acid lowers pH to re-protonate the anion back to a neutral, oil-soluble free base; fed through FCV-103 with nonlinear (log-pH) tuning so it can&rsquo;t overshoot the target and degrade the acid-sensitive API.<br/><b>Spec:</b> drives to pH 7.5–8.5 <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'v103', type: 'custom', position: { x: 270, y: 450 }, parentId: 'b3', extent: 'parent', data: { title: 'Secondary Extractor', subtitle: 'pH Adjustment Vessel', hoverDetails: '<b>Tag:</b> V-103 <sup>[4]</sup><br/><b>Type:</b> Hastelloy C-276 stirred tank (resists the acid)<br/><b>How:</b> AIC-101 reads AT-101, an inline pH probe in a recirculation loop, and modulates FCV-103 acid flow to hold the setpoint; the freed neutral base then partitions up into the added MIBK. <sup>[7]</sup><br/><b>Spec:</b> pH 7.5–8.5 setpoint', typeClass: 'node-unitOp' } },

  { id: 'v104b', type: 'custom', position: { x: 30, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'MIBK Solvent', subtitle: 'Extraction', hoverDetails: '<b>Tag:</b> V-104B<br/><b>Type:</b> Solvent dosing tank<br/><b>How:</b> MIBK (density ~0.80, so it floats) is charged first as a wash to pull trace organics off the aqueous extract, then a second time to dissolve the re-protonated free base out of the water.<br/><b>Spec:</b> 18 L MIBK total (9 L wash + 9 L extract) <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'w_aq', type: 'custom', position: { x: 530, y: 650 }, parentId: 'b3', extent: 'parent', data: { title: 'Aqueous Waste', subtitle: 'ETP', hoverDetails: '<b>Type:</b> Spent aqueous phase<br/><b>How:</b> Once the base has moved into the MIBK, the bottom aqueous layer — now ammonium acetate — is drained to effluent treatment.<br/><b>Route:</b> &rarr; ETP <sup>[8]</sup>', typeClass: 'node-waste' } },
  { id: 'b3_out', type: 'custom', position: { x: 530, y: 550 }, parentId: 'b3', extent: 'parent', data: { title: 'Purified Free Base', subtitle: 'In MIBK', hoverDetails: '<b>Type:</b> Purified organic stream &rarr; R-104<br/><b>How:</b> The top MIBK layer carrying the neutral free base is drawn off above the phase boundary and sent to salt formation.<br/><b>Spec:</b> esomeprazole free base in 9 L MIBK <sup>[3, 10]</sup>', typeClass: 'node-product' } },

  // Block 4 Nodes
  { id: 'v105a', type: 'custom', position: { x: 30, y: 100 }, parentId: 'b4', extent: 'parent', data: { title: 'Potassium Source', subtitle: 'KOMe', hoverDetails: '<b>Tag:</b> V-105A <sup>[4]</sup><br/><b>Type:</b> Alkaline (methanolic) dosing tank<br/><b>How:</b> KOMe deprotonates the free base to a potassium salt — an intermediate that crystallizes cleanly and rejects impurities before the final magnesium exchange (a chemical purification step).<br/><b>Spec:</b> methanolic KOMe <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'r104a', type: 'custom', position: { x: 270, y: 100 }, parentId: 'b4', extent: 'parent', data: { title: 'Salt Reactor Phase 1', subtitle: 'Potassium Intermediate', hoverDetails: '<b>Tag:</b> R-104 (Pathway B, Phase 1) <sup>[4]</sup><br/><b>Type:</b> Jacketed GLR stirred-tank reactor<br/><b>How:</b> TIC-104 (TT-104 RTD &rarr; TCV-104 jacket valve) holds a mild 35°C while seed crystals are added and the mass is stirred 12–14 hr, growing pure K-salt slowly — mild heat prevents a premature messy precipitation. <sup>[7]</sup><br/><b>Spec:</b> 35°C, 12–14 hr aging <sup>[3]</sup>', typeClass: 'node-unitOp' } },
  { id: 'f102', type: 'custom', position: { x: 530, y: 100 }, parentId: 'b4', extent: 'parent', data: { title: 'Nutsche Filter', subtitle: 'Intermediate Isolation', hoverDetails: '<b>Tag:</b> F-102 <sup>[5]</sup><br/><b>Type:</b> Agitated Nutsche Filter (ANF)<br/><b>How:</b> Vacuum pulls the impurity-laden mother liquor down through the filter mesh; the built-in agitator smooths the cake to stop channeling, then a methanol/toluene wash rinses the isolated K-salt.<br/><b>Spec:</b> isolates pure K-salt cake', typeClass: 'node-unitOp' } },
  { id: 'w_ml', type: 'custom', position: { x: 790, y: 100 }, parentId: 'b4', extent: 'parent', data: { title: 'Mother Liquor Waste', subtitle: 'ETP', hoverDetails: '<b>Type:</b> Filtrate mother liquor<br/><b>How:</b> Carries the rejected free-base impurities away from the pure crystalline intermediate.<br/><b>Route:</b> &rarr; ETP', typeClass: 'node-waste' } },

  { id: 'v105c', type: 'custom', position: { x: 270, y: 300 }, parentId: 'b4', extent: 'parent', data: { title: 'MgSO4 Dosing', subtitle: 'Hopper', hoverDetails: '<b>Tag:</b> V-105C <sup>[4]</sup><br/><b>Type:</b> Solid dosing hopper<br/><b>How:</b> WIC-104 load cells weigh the hopper and gate a rotary airlock so MgSO&#8324;·7H&#8322;O is fed slowly over 3 hr, keeping the ion-exchange rate controlled. <sup>[7]</sup><br/><b>Spec:</b> 3 hr gravimetric dose <sup>[3]</sup>', typeClass: 'node-input' } },
  { id: 'r104b', type: 'custom', position: { x: 530, y: 300 }, parentId: 'b4', extent: 'parent', data: { title: 'Salt Reactor Phase 2', subtitle: 'Magnesium Exchange', hoverDetails: '<b>Tag:</b> R-104 (Ion-Exchange Phase) <sup>[4]</sup><br/><b>Type:</b> Vacuum-rated GLR stirred tank <sup>[5]</sup><br/><b>How:</b> Dosed Mg&sup2;&#8314; displaces potassium; insoluble esomeprazole magnesium precipitates while soluble K&#8322;SO&#8324; stays dissolved. PIC-104 (PT-104 &rarr; PCV-104 bleed, VP-101 pump, E-104 condenser) can pull vacuum for low-temp solvent stripping; 30–70 min elutriation washes byproduct out. <sup>[6]</sup><br/><b>Spec:</b> Mg-for-K exchange', typeClass: 'node-unitOp' } },

  { id: 'w_k2so4', type: 'custom', position: { x: 790, y: 450 }, parentId: 'b4', extent: 'parent', data: { title: 'Aqueous Waste', subtitle: 'K2SO4 Byproduct', hoverDetails: '<b>Type:</b> Dissolved byproduct stream<br/><b>How:</b> The soluble potassium sulfate stays in the liquor and is elutriated (washed) away from the solid API.<br/><b>Route:</b> &rarr; ETP', typeClass: 'node-waste' } },
  { id: 'b4_out', type: 'custom', position: { x: 790, y: 300 }, parentId: 'b4', extent: 'parent', data: { title: 'API Slurry', subtitle: 'Esomeprazole Mg', hoverDetails: '<b>Type:</b> Crystallization-solvent slurry &rarr; CR-105<br/><b>How:</b> The high-density solid esomeprazole magnesium, suspended in solvent, is moved by a diaphragm slurry pump to final crystallization.<br/><b>Spec:</b> solid esomeprazole magnesium in solvent <sup>[3]</sup>', typeClass: 'node-product' } },

  // Block 5 Nodes
  { id: 'v106a', type: 'custom', position: { x: 30, y: 100 }, parentId: 'b5', extent: 'parent', data: { title: 'Anti-Solvent', subtitle: 'Acetone', hoverDetails: '<b>Tag:</b> V-106A <sup>[4]</sup><br/><b>Type:</b> Anti-solvent dosing tank<br/><b>How:</b> Acetone is dosed in slowly to lower the API&rsquo;s solubility and push the batch into supersaturation, forcing more product out of solution as crystals.<br/><b>Spec:</b> acetone anti-solvent', typeClass: 'node-input' } },
  { id: 'cr105', type: 'custom', position: { x: 270, y: 100 }, parentId: 'b5', extent: 'parent', data: { title: 'Final Crystallizer', subtitle: 'Controlled Cooling', hoverDetails: '<b>Tag:</b> CR-105 <sup>[3]</sup><br/><b>Type:</b> GLR cooling crystallizer, hydrofoil agitator<br/><b>How:</b> TIC-105 cascade ramps the jacket linearly 30°C &rarr; 5°C over 10 hr; the slow curve grows large, pure, filterable crystals (sudden cooling would flash a mass of tiny unfilterable ones). The gentle hydrofoil suspends them without shear-crushing. <sup>[4]</sup><br/><b>Spec:</b> 30°C &rarr; 5°C over 10 hr', typeClass: 'node-unitOp' } },

  { id: 'v106b', type: 'custom', position: { x: 270, y: 300 }, parentId: 'b5', extent: 'parent', data: { title: 'Wash Solvent', subtitle: 'Chilled Acetone', hoverDetails: '<b>Tag:</b> V-106B<br/><b>Type:</b> Wash-solvent dosing tank<br/><b>How:</b> Chilled acetone is sprayed onto the filter cake to rinse surface impurities away without redissolving the cold product crystals.<br/><b>Spec:</b> chilled acetone', typeClass: 'node-input' } },
  { id: 'f105', type: 'custom', position: { x: 530, y: 100 }, parentId: 'b5', extent: 'parent', data: { title: 'ANFD', subtitle: 'Filter & Dryer', hoverDetails: '<b>Tag:</b> F-105 <sup>[4]</sup><br/><b>Type:</b> Hastelloy C-22 Agitated Nutsche Filter Dryer<br/><b>How:</b> One sealed unit filters (vacuum through the mesh), washes, then dries — PIC-105 holds vacuum while TIC-106 gives mild jacket heat capped at 40°C, so organic solvent leaves but the crystal-lattice trihydrate water stays. Containment shields operators from the potent API dust. <sup>[3]</sup><br/><b>Spec:</b> dry ≤ 40°C, KF-verified', typeClass: 'node-unitOp' } },

  { id: 'w_ml2', type: 'custom', position: { x: 790, y: 300 }, parentId: 'b5', extent: 'parent', data: { title: 'Mother Liquor Waste', subtitle: 'SRU', hoverDetails: '<b>Type:</b> Filtrate mother liquor<br/><b>How:</b> The liquid pulled through the filter is routed off for acetone recovery and reuse.<br/><b>Route:</b> &rarr; SRU', typeClass: 'node-waste' } },
  { id: 'm105', type: 'custom', position: { x: 790, y: 100 }, parentId: 'b5', extent: 'parent', data: { title: 'Conical Mill', subtitle: 'Particle Sizing', hoverDetails: '<b>Tag:</b> M-105<br/><b>Type:</b> Conical mill &amp; sieve<br/><b>How:</b> The dried cake drops down an enclosed chute and is gently delumped through a screen to the fine particle size needed for bioavailability — no operator dust exposure.<br/><b>Spec:</b> d90 &lt; 15 µm <sup>[8]</sup>', typeClass: 'node-unitOp' } },

  { id: 'out', type: 'custom', position: { x: 790, y: 220 }, parentId: 'b5', extent: 'parent', data: { title: 'Final API', subtitle: 'Esomeprazole Mg Trihydrate', hoverDetails: '<b>Type:</b> Final packaged API<br/><b>How:</b> Milled powder drops into HDPE drums with double anti-static LDPE liners, then goes to quarantine for QA/QC release before tableting.<br/><b>Spec:</b> esomeprazole magnesium trihydrate <sup>[3]</sup>', typeClass: 'node-product' } },
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
  { id: 'e-v104a-ex101', source: 'v104a', target: 'ex101', type: 'step', label: 'Aq. NH₃ 60 L (12.5%)' },
  { id: 'e-ex101-w_tol', source: 'ex101', target: 'w_tol', type: 'step', className: 'waste-edge', label: 'Waste toluene + Ti catalyst' },

  { id: 'e-ex101-v103', source: 'ex101', target: 'v103', type: 'step', label: 'Aqueous anion extract · LIC-101' },
  { id: 'e-v104c-v103', source: 'v104c', target: 'v103', type: 'step', label: 'Acetic acid · FCV-103 (AIC-101)' },
  { id: 'e-v104b-v103', source: 'v104b', target: 'v103', type: 'step', label: 'MIBK 18 L' },

  { id: 'e-v103-w_aq', source: 'v103', target: 'w_aq', type: 'step', className: 'waste-edge', label: 'Aq. ammonium acetate' },
  { id: 'e-v103-b3', source: 'v103', target: 'b3_out', type: 'step', label: 'Free base in 9 L MIBK' },

  // B4
  { id: 'e-b3-r104a', source: 'b3_out', target: 'r104a', type: 'step', label: 'Free base / MIBK' },
  { id: 'e-v105a-r104a', source: 'v105a', target: 'r104a', type: 'step', label: 'KOMe (methanolic) · TIC-104' },

  { id: 'e-r104a-f102', source: 'r104a', target: 'f102', type: 'step', label: 'K-salt slurry (14 hr age)' },
  { id: 'e-f102-w_ml', source: 'f102', target: 'w_ml', type: 'step', className: 'waste-edge', label: 'Impurity mother liquor' },

  { id: 'e-f102-r104b', source: 'f102', target: 'r104b', type: 'step', label: 'Pure K-salt cake' },
  { id: 'e-v105c-r104b', source: 'v105c', target: 'r104b', type: 'step', label: 'MgSO₄·7H₂O · WIC-104 (3 hr)' },

  { id: 'e-r104b-w_k2so4', source: 'r104b', target: 'w_k2so4', type: 'step', className: 'waste-edge', label: 'K₂SO₄ liquor · elutriation' },
  { id: 'e-r104b-b4', source: 'r104b', target: 'b4_out', type: 'step', label: 'Esomeprazole-Mg slurry · PIC-104' },

  // B5
  { id: 'e-b4-cr105', source: 'b4_out', target: 'cr105', type: 'step', label: 'API slurry' },
  { id: 'e-v106a-cr105', source: 'v106a', target: 'cr105', type: 'step', label: 'Acetone (anti-solvent) · TIC-105' },

  { id: 'e-cr105-f105', source: 'cr105', target: 'f105', type: 'step', label: 'Cold crystal slurry (5°C)' },
  { id: 'e-v106b-f105', source: 'v106b', target: 'f105', type: 'step', label: 'Chilled acetone wash' },

  { id: 'e-f105-w_ml2', source: 'f105', target: 'w_ml2', type: 'step', className: 'waste-edge', label: 'Mother liquor → SRU' },
  { id: 'e-f105-m105', source: 'f105', target: 'm105', type: 'step', label: 'Dry API cake · PIC-105 (≤40°C)' },

  { id: 'e-m105-out', source: 'm105', target: 'out', type: 'step', label: 'Milled API · d90 < 15 µm' },
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
