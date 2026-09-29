import { RigComponentId, RigComponentMetadata } from '../../types/rig3d';

export const RIG_COMPONENTS_CATALOG: Record<RigComponentId, RigComponentMetadata> = {
  pump_jack_base: {
    id: 'pump_jack_base',
    name: 'Skid Base & Foundation',
    category: 'surface',
    description: 'Heavy structural steel skid mounted on reinforced concrete pad, anchoring the Samson post, prime mover, and gear reducer.',
    function: 'Maintains structural rigidity and absorbs reciprocating mechanical shock and cyclic overturning moments.',
    specifications: {
      'Mounting Type': 'Reinforced API Structural Steel Skid',
      'Foundation': 'Cast-in-place Reinforced Concrete Pad',
      'Structural Rating': 'API Spec 11E Class III',
      'Anchor Bolts': '8x High-Tensile 1.5" Foundation Studs'
    }
  },
  samson_post: {
    id: 'samson_post',
    name: 'Samson Post A-Frame',
    category: 'surface',
    description: 'Heavy four-legged tubular steel A-frame supporting the center bearing (saddle bearing) of the oscillating walking beam.',
    function: 'Serves as the central fulcrum supporting the total cantilevered structural load of the walking beam and rod string.',
    specifications: {
      'Configuration': '4-Legged Braced Tubular Steel A-Frame',
      'Center Bearing': 'Heavy-duty Spherical Roller Saddle Bearing',
      'Structural Load Limit': '160,000 lbs (711 kN)',
      'Height to Center Bearing': '4.85 m'
    }
  },
  walking_beam: {
    id: 'walking_beam',
    name: 'Walking Beam',
    category: 'mechanical',
    description: 'Large wide-flange steel beam pivoted near its center on the Samson post saddle bearing.',
    function: 'Converts rotary crank motion into vertical reciprocating lift; transmits lifting force to the sucker rod string.',
    specifications: {
      'Beam Profile': 'W24 x 104 Heavy Wide-Flange Structural Steel',
      'Overall Length': '6.40 m (Front arm: 3.60 m, Rear arm: 2.80 m)',
      'Rated Beam Load': '32,000 lbs (142 kN)',
      'Pivot Efficiency': '98.5% with grease-lubricated roller bearings'
    },
    telemetryBinding: {
      primaryValueKey: 'rod_load_kn',
      label: 'Cyclic Peak Load',
      unit: 'kN'
    }
  },
  horsehead: {
    id: 'horsehead',
    name: 'Horsehead & Bridle',
    category: 'mechanical',
    description: 'Curved circular arc segment mounted to the front tip of the walking beam with twin wire-rope bridle cables.',
    function: 'Ensures the polished rod is drawn straight up and down along the true vertical centerline of the wellhead without lateral bending stresses.',
    specifications: {
      'Arc Geometry': 'Involute circular arc tangent to wellbore centerline',
      'Bridle Material': 'Twin 1.25" High-Flexibility Galvanized Steel Wire Ropes',
      'Carrier Bar': 'Forged Alloy Steel Carrier Bar with Rod Clamp',
      'Maximum Polished Rod Stroke': 'Up to 3.20 m'
    },
    telemetryBinding: {
      primaryValueKey: 'stroke_m',
      label: 'Operating Stroke',
      unit: 'm'
    }
  },
  pitman_arm: {
    id: 'pitman_arm',
    name: 'Pitman Arms & Equalizer Bar',
    category: 'mechanical',
    description: 'Dual structural connecting links joining the rotating crank pins to the equalizer crossbar at the rear of the walking beam.',
    function: 'Transfers high rotational torque from crank pins into reciprocating linear force at the rear lever of the walking beam.',
    specifications: {
      'Configuration': 'Twin Box-Section Alloy Steel Pitmans',
      'Equalizer Bearing': 'Self-aligning spherical roller bearings with grease seals',
      'Length': '2.45 m pin-to-pin',
      'Torque Capacity': '456,000 in-lbs (51.5 kNm)'
    }
  },
  crank_counterweight: {
    id: 'crank_counterweight',
    name: 'Crank & Counterweights',
    category: 'mechanical',
    description: 'Dual counterbalanced crank arms keyed to the slow-speed output shaft of the gear reducer with adjustable counterweight slabs.',
    function: 'Counterbalances the weight of the sucker rod string and heavy fluid column during the upstroke, leveling cyclic motor torque.',
    specifications: {
      'Counterbalance Type': 'Torqmaster Adjustable Lead-Core Counterweights',
      'Max Structural Unbalance': '28,000 lbs (124.5 kN)',
      'Crank Arm Radius': '0.90 m to 1.60 m (adjustable pin positions)',
      'Rotation Direction': 'Clockwise viewed from gear face'
    },
    telemetryBinding: {
      primaryValueKey: 'spm',
      label: 'Crank Speed',
      unit: 'SPM'
    }
  },
  gearbox: {
    id: 'gearbox',
    name: 'Gear Reducer (Double Reduction)',
    category: 'mechanical',
    description: 'Enclosed double-reduction helical or herringbone gear drive unit reducing electric motor speed down to pumping speed.',
    function: 'Multiplies drive motor torque while reducing input shaft speed (~1200 RPM) to operational pumping cadence (4–8 SPM).',
    specifications: {
      'Gearbox Type': 'API Double-Reduction Involute Herringbone Gearbox',
      'Rated Peak Torque': '456,000 in-lbs (51.5 kNm)',
      'Nominal Reduction Ratio': '30.5 : 1',
      'Lubrication': 'Splash bath with synthetic ISO VG 220 industrial gear oil'
    },
    telemetryBinding: {
      primaryValueKey: 'spm',
      label: 'Output Speed',
      unit: 'SPM'
    }
  },
  electric_motor: {
    id: 'electric_motor',
    name: 'Electric Prime Mover',
    category: 'electrical',
    description: 'Heavy-duty 3-phase NEMA Class D high-slip induction motor designed for cyclic reversing loads in artificial lift operations.',
    function: 'Supplies electrical mechanical power to the gear reducer via multiple high-tension V-belts.',
    specifications: {
      'Motor Type': '3-Phase High-Slip NEMA Class D Induction Motor',
      'Nominal Power': '50 HP (37.3 kW)',
      'Rated Voltage': '460 V AC / 3-Phase / 50 Hz',
      'Enclosure': 'TEFC (Totally Enclosed Fan Cooled), Class I Div 2'
    },
    telemetryBinding: {
      primaryValueKey: 'energy_kwh',
      label: 'Energy Rate',
      unit: 'kWh'
    }
  },
  vfd_cabinet: {
    id: 'vfd_cabinet',
    name: 'VFD Control Console & SCADA RTU',
    category: 'electrical',
    description: 'Variable Frequency Drive panel with integrated digital twin edge telemetry unit, motor protection, and automated speed control.',
    function: 'Regulates motor frequency (Hz) to dynamically adapt pumping speed (SPM), mitigate rod floating, and optimize power factor.',
    specifications: {
      'Drive Type': 'Vector Controlled VFD with Dynamic Braking Resistors',
      'Frequency Range': '15.0 Hz to 65.0 Hz (Nominal: 45 Hz)',
      'Control Loop': 'Automated Closed-Loop SPM Adjuster from BagheTwin Twin Service',
      'Telemetry Protocol': 'Modbus TCP / MQTT Edge Gateway'
    },
    telemetryBinding: {
      primaryValueKey: 'vfd_hz',
      label: 'Operating Frequency',
      unit: 'Hz'
    }
  },
  wellhead: {
    id: 'wellhead',
    name: 'Wellhead Christmas Tree & Manifold',
    category: 'hydraulic',
    description: 'High-pressure surface wellhead assembly including casing spool, tubing spool, master gate valves, and production wing valve.',
    function: 'Provides mechanical support for downhole casing/tubing strings, seals the wellbore annulus, and channels produced crude oil.',
    specifications: {
      'Pressure Rating': 'API 6A 3000 psi Working Pressure',
      'Thermal Rating': 'API 6A Class V (rated up to 260°C for CSS thermal service)',
      'Valves': 'Dual Gate Valves (Lower/Upper Master) + Wing Choke Valve',
      'Annulus Access': 'Dual 2" High-Pressure Ball Valves with Pressure Transducers'
    },
    telemetryBinding: {
      primaryValueKey: 'pressure_bar',
      label: 'Wellhead Pressure',
      unit: 'bar'
    }
  },
  stuffing_box: {
    id: 'stuffing_box',
    name: 'Polished Rod Stuffing Box',
    category: 'surface',
    description: 'Flanged packing gland mounted on top of the tubing tee with self-lubricating cone packing rings encircling the polished rod.',
    function: 'Prevents wellbore crude oil and gas leakage at surface while allowing vertical reciprocating rod stroke.',
    specifications: {
      'Packing Type': 'Dual-Chamber Cone Packing with Internal Environmental Pollution Chamber',
      'Polished Rod Diameter': '1.50" (38.1 mm) Hardened Stainless Steel',
      'Thermal Rating': 'Reinforced Kevlar-PTFE thermal packing rated to 220°C',
      'Leak Detection': 'Continuous Electronic Pressure/Leak Transducer'
    }
  },
  flowline: {
    id: 'flowline',
    name: 'Surface Production Flowline',
    category: 'hydraulic',
    description: 'Insulated 4-inch carbon steel pipeline transporting produced heavy crude emulsion from the wellhead to field gathering stations.',
    function: 'Conveys viscous crude oil emulsion without heat loss to prevent wax deposition and viscosity increase before separation.',
    specifications: {
      'Nominal Diameter': '4" Schedule 40 Seamless Carbon Steel (ASTM A106)',
      'Insulation': '50 mm High-Density Polyurethane with Waterproof Jacketing',
      'Heat Tracing': 'Electric Trace-Heated for Baghewala heavy crude start-ups',
      'Design Pressure': '600 psi (41.4 bar)'
    },
    telemetryBinding: {
      primaryValueKey: 'oil_bopd',
      label: 'Net Flow Rate',
      unit: 'BOPD'
    }
  },
  bridle_cable: {
    id: 'bridle_cable',
    name: 'Bridle Wire Cable & Clamp',
    category: 'surface',
    description: 'Paired steel wire rope slings seated in the curved grooves of the horsehead, attached to the carrier bar clamp.',
    function: 'Suspends the polished rod and downhole string with zero lateral bending moment throughout the stroke arc.',
    specifications: {
      'Cable Diameter': '1.25" High-Tensile Aircraft Cable',
      'Safety Factor': 'Minimum 3.5:1 against peak polished rod load',
      'Attachment': 'Forged Swaged Sleeves to Alloy Steel Carrier Bar',
      'Stroke Tangency': 'Maintains ±1 mm axial vertical alignment'
    }
  },
  surface_casing: {
    id: 'surface_casing',
    name: 'Surface Casing String',
    category: 'subsurface',
    description: 'Large-diameter heavy steel pipe cemented from surface down through shallow strata into solid bed formation.',
    function: 'Isolates and protects shallow groundwater aquifers, prevents cave-ins, and supports the wellhead stack.',
    specifications: {
      'Outer Diameter': '13-3/8" (339.7 mm)',
      'Depth': '0 to 180 m Ground Level',
      'Steel Grade': 'API J-55 Seamless Steel Casing',
      'Cementing': 'Class G Cement circulated to surface'
    }
  },
  production_casing: {
    id: 'production_casing',
    name: 'Production Casing String',
    category: 'subsurface',
    description: 'Continuous casing string extending from surface down through caprock and across the entire hydrocarbon pay interval.',
    function: 'Isolates thief zones, withstands high thermal expansion during steam injection, and prevents wellbore collapse.',
    specifications: {
      'Outer Diameter': '9-5/8" (244.5 mm) Premium Buttress Connection',
      'Total Depth': '0 to 1,050 m Total Depth (Baghewala target interval)',
      'Thermal Steel Grade': 'L-80 Special Thermal Service with 0.5% Molybdenum',
      'Thermal Expansion Allowance': 'High-temperature expansion casing couplings'
    }
  },
  production_tubing: {
    id: 'production_tubing',
    name: 'Production Tubing String',
    category: 'subsurface',
    description: 'Retrievable high-grade alloy steel conduit string run concentrically inside production casing down to the pump seat.',
    function: 'Transports produced heavy oil from the downhole pump discharge up to the surface wellhead tree.',
    specifications: {
      'Outer Diameter': '3-1/2" (88.9 mm) External Upset Ends (EUE)',
      'Setting Depth': 'Land at 960 m (above downhole pump seating nipple)',
      'Steel Grade': 'N-80 High Strength Seamless Tubing',
      'Seating Nipple': 'API Type 11AX Mechanical Seating Nipple'
    },
    telemetryBinding: {
      primaryValueKey: 'fluid_level_m',
      label: 'Working Fluid Level',
      unit: 'm'
    }
  },
  sucker_rod_string: {
    id: 'sucker_rod_string',
    name: 'Tapered Sucker Rod String',
    category: 'mechanical',
    description: 'Tapered string of high-strength solid alloy steel rods extending from the polished rod down to the downhole pump plunger.',
    function: 'Transmits reciprocating mechanical power from the surface walking beam downhole to operate the positive displacement pump.',
    specifications: {
      'String Design': 'Tapered API Grade D Sucker Rods (1", 7/8", and 3/4")',
      'Total Length': '980 m suspended depth',
      'Centralizers': 'Wheeled snap-on molded rod guides every 25 m to prevent tubing wear',
      'Critical Risk Factor': 'Susceptible to viscous rod-floating during downstroke in heavy oil'
    },
    telemetryBinding: {
      primaryValueKey: 'rod_floating_risk',
      label: 'Rod-Floating Risk',
      unit: '%'
    }
  },
  downhole_pump_barrel: {
    id: 'downhole_pump_barrel',
    name: 'Downhole Pump Barrel (Stator)',
    category: 'subsurface',
    description: 'Stationary heavy-wall steel barrel anchored securely inside the production tubing via a mechanical hold-down shoe.',
    function: 'Encloses the fluid chamber where reciprocating action compresses and lifts viscous fluid into the production tubing.',
    specifications: {
      'API Classification': 'API Spec 11AX Heavy-Wall Insert Barrel (RHAM)',
      'Bore Diameter': '2.25" (57.2 mm)',
      'Barrel Material': 'Carbonitrided Carbon Steel with Chrome-Plated Interior',
      'Setting Depth': '985 m True Vertical Depth'
    },
    telemetryBinding: {
      primaryValueKey: 'pump_efficiency_pct',
      label: 'Volumetric Efficiency',
      unit: '%'
    }
  },
  pump_plunger: {
    id: 'pump_plunger',
    name: 'Reciprocating Pump Plunger',
    category: 'subsurface',
    description: 'Precision-ground alloy steel plunger attached to the bottom of the sucker rod string, sliding tightly inside the barrel.',
    function: 'Cycles upward to lift fluid column above it, and downward to pass fluid through the traveling valve.',
    specifications: {
      'Plunger Fit': 'API Fit -2 to -3 (0.002" to 0.003" clearance for heavy oil)',
      'Coating': 'Spray-welded nickel-chromium alloy wear coating',
      'Stroke Travel': '2.80 m nominal stroke',
      'Valve Cage': 'Monel Ball and Tungsten Carbide Valve Seat'
    }
  },
  standing_valve: {
    id: 'standing_valve',
    name: 'Standing Valve (Intake Check)',
    category: 'hydraulic',
    description: 'Stationary check valve assembly located at the bottom of the downhole pump barrel.',
    function: 'Opens on plunger upstroke to admit reservoir fluid into the barrel; closes on downstroke to support the fluid column.',
    specifications: {
      'Valve Type': 'Fluted Ball & High-Profile Seat Check Valve',
      'Ball Material': 'Tungsten Carbide with Cobalt Binder',
      'Seat Material': 'Precision-Lapped Solid Tungsten Carbide',
      'Sealing Differential': 'Holds up to 3,500 psi downhole hydrostatic head'
    }
  },
  traveling_valve: {
    id: 'traveling_valve',
    name: 'Traveling Valve (Discharge Check)',
    category: 'hydraulic',
    description: 'Moving check valve assembly incorporated directly into the top of the reciprocating pump plunger.',
    function: 'Opens on plunger downstroke to allow trapped fluid to bypass above the plunger; seals on upstroke to lift fluid to surface.',
    specifications: {
      'Valve Type': 'Heavy-duty Ball and Seat Assembly within Plunger Body',
      'Ball / Seat Pair': 'Cobalt-alloy Ball with Titanium Carbide Lapped Seat',
      'Operation': 'Hydrodynamic differential pressure actuated',
      'Dynamic Response': 'Sub-second seating cycle synchronized with SPM'
    }
  },
  reservoir_sand: {
    id: 'reservoir_sand',
    name: 'Baghewala Heavy-Oil Sandstone',
    category: 'geological',
    description: 'Cambrian-age Jodhpur sandstone formation bearing ultra-heavy crude oil with low mobility at native reservoir temperatures.',
    function: 'Hydrocarbon-bearing pay zone storing viscous oil mobilized by Cyclic Steam Stimulation (CSS) thermal heating.',
    specifications: {
      'Formation Name': 'Jodhpur Sandstone (Baghewala Field, Bikaner-Nagaur Basin)',
      'Depth Interval': '980 m to 1,040 m TVD (60 m gross pay thickness)',
      'Crude Gravity': '16.5° API (Extra Heavy Crude Oil)',
      'Native Viscosity': '3,500 cP at initial reservoir temp (46°C); drops to ~300 cP after steam soak'
    },
    telemetryBinding: {
      primaryValueKey: 'oil_viscosity_cp',
      label: 'Viscosity at Pay Zone',
      unit: 'cP'
    }
  },
  steam_injection_line: {
    id: 'steam_injection_line',
    name: 'CSS Thermal Steam Pathway',
    category: 'subsurface',
    description: 'Dual-purpose thermal steam injection conduit and packer system delivering 80%+ quality steam into the formation.',
    function: 'Delivers high-pressure superheated steam during the INJECTION phase to heat the reservoir matrix and melt viscous heavy oil.',
    specifications: {
      'Steam Quality': '80% to 85% Saturated Vapor at Wellhead',
      'Max Injection Pressure': '35.0 bar (3.5 MPa)',
      'Typical Cycle Volume': '400 to 600 metric tons steam per cycle',
      'Thermal Expansion Joint': 'Downhole expansion joint compensating for 1.8 m thermal elongation'
    },
    telemetryBinding: {
      primaryValueKey: 'temperature_c',
      label: 'Formation Temperature',
      unit: '°C'
    }
  },
  perforation_zone: {
    id: 'perforation_zone',
    name: 'Casing Perforations & Slotted Liner',
    category: 'subsurface',
    description: 'Jet-perforated casing tunnels penetrating through cement sheath into the sandstone reservoir pay interval.',
    function: 'Provides hydraulic conduit for steam dispersion into the formation and subsequent drainage of mobilized heavy oil into the wellbore.',
    specifications: {
      'Perforation Density': '6 shots per foot (SPF) at 60° spiral phasing',
      'Charge Type': 'Deep-Penetrating RDX Shaped Charges (0.42" entrance hole)',
      'Tunnel Depth': '22" clean penetration into sandstone matrix',
      'Sand Control': 'High-temperature gravel pack with slotted liner'
    }
  },
  geological_overburden: {
    id: 'geological_overburden',
    name: 'Overburden Rock Formations',
    category: 'geological',
    description: 'Sequence of Tertiary and Mesozoic sedimentary rocks, limestones, and clays overlying the deep reservoir horizon.',
    function: 'Imposes lithostatic overburden pressure (0.23 bar/m) compacting the underlying strata.',
    specifications: {
      'Interval': '0 m to 850 m TVD',
      'Lithology': 'Alluvial sands, calcareous shales, and dense Bilara limestone',
      'Thermal Conductivity': '2.1 W/(m·K)',
      'Overburden Stress': 'Approx. 220 bar lithostatic gradient at depth'
    }
  },
  geological_caprock: {
    id: 'geological_caprock',
    name: 'Impermeable Shale Caprock',
    category: 'geological',
    description: 'Dense, impermeable clay-shale caprock seal immediately overlying the porous Baghewala sandstone pay zone.',
    function: 'Prevents upward steam breakthrough, traps reservoir fluids, and maintains thermal containment during high-pressure CSS cycles.',
    specifications: {
      'Lithology': 'Dense Anhydritic Clay-Shale Seal',
      'Thickness': '35 m continuous barrier',
      'Permeability': '< 0.001 mD (effective hydraulic barrier)',
      'Integrity Limit': 'Withstands up to 45 bar steam injection pressure without fracture'
    }
  }
};
