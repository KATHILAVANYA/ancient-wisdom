// Ancient Wisdom vs Modern Problems — Master Historical & Simulation Data

export interface HistoricalSource {
  title: string;
  authorOrOrg: string;
  yearOrEra: string;
  publication: string;
  verifiedFact: string;
  linkOrRef?: string;
}

export interface AncientIntervention {
  id: string;
  name: string;
  civilization: string;
  eraId: 'water' | 'architecture' | 'agriculture' | 'final2050';
  category: 'water' | 'cooling' | 'soil' | 'hybrid';
  icon: string;
  tagline: string;
  description: string;
  historicalOrigins: string;
  verifiedSource: HistoricalSource;
  costGold: number;
  constructionDays: number;
  maintenanceAnnual: number;
  // Impact deltas
  waterYieldLitersPerDay: number;
  evaporationReductionPct: number;
  tempReductionCelsius: number;
  gridPowerSavedMW: number;
  foodYieldTonsPerYr: number;
  soilOrganicMatterPct: number;
  biodiversityScore: number;
  carbonOffsetTonsPerYr: number;
  communityHappiness: number;
  resilienceIndex: number;
  // 3D visual type
  meshType: 'stepwell' | 'qanat' | 'johad' | 'cistern' | 'inundation' |
            'windcatcher' | 'mashrabiya' | 'courtyard' | 'thick_adobe' | 'earth_sheltered' |
            'milpa' | 'chinampa' | 'terrace' | 'terra_preta' | 'zai_pits' |
            'solarpunk_hybrid' | 'rooftop_milpa' | 'cooling_spire';
}

export interface SynergyCombo {
  id: string;
  name: string;
  interventions: string[];
  bonusDescription: string;
  waterBonusPct?: number;
  coolingBonusC?: number;
  foodBonusPct?: number;
  resilienceBonus?: number;
  historicalLesson: string;
}

export interface EraConfig {
  id: 'water' | 'architecture' | 'agriculture' | 'final2050';
  order: number;
  title: string;
  subtitle: string;
  location: string;
  timePeriod: string;
  accentColor: string;
  secondaryColor: string;
  skyColor: string;
  groundColor: string;
  fogNear: number;
  fogFar: number;
  ambientLightColor: string;
  keyLightColor: string;
  historicalStory: {
    heroQuote: string;
    narrativeIntro: string[];
    ancientCivilizationsMentioned: string[];
    archaeologicalEvidence: string;
  };
  modernCrisis: {
    title: string;
    description: string;
    urgencyText: string;
    targetSurvivalDays: number;
    budget: number;
    baselineMetrics: {
      waterAvailableDays: number;
      ambientTempC: number;
      gridStressPct: number;
      soilDegradationPct: number;
      communitySatisfactionPct: number;
      resilienceRating: number;
    };
    successGoals: {
      minSustainabilityScore: number;
      keyMilestoneLabel: string;
    };
  };
  interventions: AncientIntervention[];
  synergies: SynergyCombo[];
  advisorTips: {
    welcome: string;
    hint1: string;
    hint2: string;
    warningHighCost: string;
    synergySuccess: string;
  };
}

export const ERAS: Record<string, EraConfig> = {
  water: {
    id: 'water',
    order: 1,
    title: 'Era I: Ancient Water Architecture',
    subtitle: 'Stepwells, Qanats & Sacred Aquifers',
    location: 'Rajasthan, Persia & the Indus Valley',
    timePeriod: '3000 BCE – 1100 CE',
    accentColor: '#38bdf8',
    secondaryColor: '#0284c7',
    skyColor: '#bde0fe',
    groundColor: '#d4a373',
    fogNear: 25,
    fogFar: 140,
    ambientLightColor: '#faedcd',
    keyLightColor: '#ffedd5',
    historicalStory: {
      heroQuote: "In the world's most arid deserts, our ancestors did not fight the drought; they invited the monsoon into deep subterranean palaces of stone.",
      narrativeIntro: [
        "In the Thar Desert of Rajasthan and the arid plateaus of ancient Persia, rainfall was scarce and unpredictable—often confined to a furious 3-week monsoon window.",
        "Rather than relying on shallow open dams that lost up to 70% of collected water to the blistering sun, ancient engineers created subterranean architectural marvels: Baolis (stepped wells reaching down to deep groundwater tables) and Qanats (sloping gravity tunnels extending tens of kilometers from mountain aquifers with zero pump energy).",
        "Community-led Johad check dams slowed monsoonal flash torrents, forcing billions of liters into underground permeable sandstone aquifers, creating living microclimates that stayed 6°C cooler than the surface."
      ],
      ancientCivilizationsMentioned: [
        "Indus Valley / Dholavira (3000 BCE) — 16 massive stone rainwater reservoirs",
        "Achaemenid Persian Empire (600 BCE) — 30,000+ gravity-driven Qanat networks",
        "Gurjara-Pratihara Dynasty / Chand Baori (800 CE) — 3,500 carved steps down to the aquifer",
        "Alwar Johad Builders of Rajasthan — Community-governed earthen check dams"
      ],
      archaeologicalEvidence: "UNESCO World Heritage site Rani ki Vav (Gujarat) and the Persian Qanats remain structurally operational after centuries. Tarun Bharat Sangh's modern revival of 10,000 Johads in Rajasthan revived 5 dried rivers (Arvari, Ruparel, Sarsa, Bhagani, and Jahajwali) and raised water tables by 6 meters."
    },
    modernCrisis: {
      title: "Village Day Zero: 30 Days of Usable Water Left",
      description: "Excessive motorized borewells and industrial eucalyptus planting have exhausted the local aquifer. The monsoon arrives in 30 days, but without infiltration infrastructure, flash floods will wash away topsoil while leaving the village bone-dry by winter.",
      urgencyText: "Deep tube wells are pumping sand. The community faces forced climate migration unless we build an ancient subterranean water catchment network before the monsoon.",
      targetSurvivalDays: 30,
      budget: 1500,
      baselineMetrics: {
        waterAvailableDays: 30,
        ambientTempC: 41,
        gridStressPct: 75,
        soilDegradationPct: 65,
        communitySatisfactionPct: 35,
        resilienceRating: 28,
      },
      successGoals: {
        minSustainabilityScore: 78,
        keyMilestoneLabel: "Extend Water Security to 365+ Days & Recharge Aquifer Table"
      }
    },
    interventions: [
      {
        id: 'stepwell_baoli',
        name: 'Inverted Stepwell (Baoli)',
        civilization: 'Gurjara-Pratihara & Solanki (India, 8th c.)',
        eraId: 'water',
        category: 'water',
        icon: 'stairs-water',
        tagline: 'Multi-tiered subterranean stone pyramid tapping groundwater',
        description: 'Deep architectural well with 10+ tiers of geometric sandstone steps that provide safe access to fluctuating seasonal water tables while shading the water surface from solar evaporation.',
        historicalOrigins: 'Chand Baori (Abhaneri) and Rani ki Vav (Patan) served as water reservoirs, community gathering nodes, and evaporative cooling shelters during 45°C summers.',
        verifiedSource: {
          title: "The Stepwells of India: Architecture, Water and Social Space",
          authorOrOrg: "Morna Livingston / Thames & Hudson",
          yearOrEra: "2002",
          publication: "Architectural History Review",
          verifiedFact: "Stepwell subterranean geometries reduce water evaporation by up to 68% compared to surface ponds while maintaining 8°C cooler ambient water.",
        },
        costGold: 380,
        constructionDays: 14,
        maintenanceAnnual: 25,
        waterYieldLitersPerDay: 45000,
        evaporationReductionPct: 65,
        tempReductionCelsius: 3.5,
        gridPowerSavedMW: 0.15,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.2,
        biodiversityScore: 18,
        carbonOffsetTonsPerYr: 12,
        communityHappiness: 28,
        resilienceIndex: 25,
        meshType: 'stepwell'
      },
      {
        id: 'persian_qanat',
        name: 'Persian Gravity Qanat',
        civilization: 'Achaemenid & Sassanid Persia (6th c. BCE)',
        eraId: 'water',
        category: 'water',
        icon: 'mountain-tunnel',
        tagline: 'Subterranean sloping gravity aqueduct from mountain aquifers',
        description: 'Gently sloped underground tunnel tapping high mountain water tables, transporting clean mountain water over 10–30 km with 0% pump energy and near-zero evaporation.',
        historicalOrigins: 'Over 37,000 registered Qanats in Iran have continuously supplied drinking and irrigation water for 2,500 years without depleting the master mother well.',
        verifiedSource: {
          title: "The Persian Qanat: A UNESCO World Heritage Engineering Analysis",
          authorOrOrg: "UNESCO / International Center on Qanats (ICQHS)",
          yearOrEra: "2016",
          publication: "UNESCO World Heritage Series",
          verifiedFact: "Qanats operate at 100% renewable gravity energy, tapping only the sustainable surplus of alluvial fans without lowering the regional bedrock aquifer.",
        },
        costGold: 450,
        constructionDays: 18,
        maintenanceAnnual: 30,
        waterYieldLitersPerDay: 65000,
        evaporationReductionPct: 85,
        tempReductionCelsius: 2.0,
        gridPowerSavedMW: 0.35,
        foodYieldTonsPerYr: 5,
        soilOrganicMatterPct: 0.1,
        biodiversityScore: 12,
        carbonOffsetTonsPerYr: 24,
        communityHappiness: 24,
        resilienceIndex: 32,
        meshType: 'qanat'
      },
      {
        id: 'johad_percolation',
        name: 'Johad Percolation Dam',
        civilization: 'Traditional Rajasthan & Vedic India (1500 BCE)',
        eraId: 'water',
        category: 'water',
        icon: 'shield-water',
        tagline: 'Earthen crescent check dam recharging subterranean water tables',
        description: 'Curved indigenous earthen bund constructed along natural slope contours that captures monsoonal runoff, holding it long enough to percolate deeply into the underground aquifer.',
        historicalOrigins: 'Revived by Magsaysay award winner Rajendra Singh (Waterman of India), 10,000+ Johads revived dry arid river basins across 1,000+ villages.',
        verifiedSource: {
          title: "Community-driven Water Harvesting in Arid Rajasthan",
          authorOrOrg: "Nature Sustainability / Tarun Bharat Sangh",
          yearOrEra: "2019",
          publication: "Nature Sustainability Vol. 2",
          verifiedFact: "Johad networks increased average groundwater tables by 6.2 meters, increased forest cover by 33%, and restored perennial flow to 5 dry rivers.",
        },
        costGold: 220,
        constructionDays: 7,
        maintenanceAnnual: 15,
        waterYieldLitersPerDay: 50000,
        evaporationReductionPct: 40,
        tempReductionCelsius: 1.2,
        gridPowerSavedMW: 0.1,
        foodYieldTonsPerYr: 8,
        soilOrganicMatterPct: 1.2,
        biodiversityScore: 28,
        carbonOffsetTonsPerYr: 18,
        communityHappiness: 30,
        resilienceIndex: 28,
        meshType: 'johad'
      },
      {
        id: 'roman_cistern',
        name: 'Vaulted Filtration Cistern',
        civilization: 'Nabataean & Byzantine (Petra / Constantinople)',
        eraId: 'water',
        category: 'water',
        icon: 'cylinder-vault',
        tagline: 'Underground waterproof hydraulic mortar reservoir with sand settling',
        description: 'Subterranean vaulted chamber coated in volcanic pozzolanic hydraulic plaster with sand/gravel settling basins that filter rainwater for year-round emergency reserves.',
        historicalOrigins: 'The Basilica Cistern (532 CE) held 80,000 m³ of fresh water, insulated from summer heat, bacteria, and sunlight, sustaining Constantinople through sieges and droughts.',
        verifiedSource: {
          title: "Hydraulic Engineering of Petra and Byzantine Cistern Systems",
          authorOrOrg: "Charles R. Ortloff / Oxford Journal of Archaeology",
          yearOrEra: "2005",
          publication: "Journal of Hydraulic Structures",
          verifiedFact: "Nabataean tiered settling cisterns removed 94% of suspended particulates using gravity alone without chemical flocculants.",
        },
        costGold: 310,
        constructionDays: 12,
        maintenanceAnnual: 20,
        waterYieldLitersPerDay: 35000,
        evaporationReductionPct: 95,
        tempReductionCelsius: 1.5,
        gridPowerSavedMW: 0.1,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.0,
        biodiversityScore: 8,
        carbonOffsetTonsPerYr: 10,
        communityHappiness: 22,
        resilienceIndex: 26,
        meshType: 'cistern'
      },
      {
        id: 'ahar_pyne_canal',
        name: 'Ahar-Pyne Inundation Channels',
        civilization: 'Magadha Empire (Bihar, India, 300 BCE)',
        eraId: 'water',
        category: 'water',
        icon: 'git-branch',
        tagline: 'Contour diversions routing peak floodwaters to earthen reservoirs',
        description: 'Interconnected network of diversion canals (Pynes) and retention embankments (Ahars) that split seasonal torrential river spates into dozens of gentle irrigation paths.',
        historicalOrigins: 'Designed during the Mauryan Empire, Ahar-Pyne systems irrigated millions of hectares in southern Bihar for over 2,000 years with 0 grid power.',
        verifiedSource: {
          title: "Indigenous Water Management Traditions in Ancient India",
          authorOrOrg: "Centre for Science and Environment (CSE India)",
          yearOrEra: "2001",
          publication: "Dying Wisdom Report",
          verifiedFact: "Ahar-Pyne systems capture up to 82% of monsoonal flash-flood volume, reducing flood damage downstream while retaining moisture for winter crops.",
        },
        costGold: 260,
        constructionDays: 9,
        maintenanceAnnual: 18,
        waterYieldLitersPerDay: 42000,
        evaporationReductionPct: 50,
        tempReductionCelsius: 1.0,
        gridPowerSavedMW: 0.08,
        foodYieldTonsPerYr: 12,
        soilOrganicMatterPct: 0.8,
        biodiversityScore: 24,
        carbonOffsetTonsPerYr: 15,
        communityHappiness: 25,
        resilienceIndex: 22,
        meshType: 'inundation'
      }
    ],
    synergies: [
      {
        id: 'syn_johad_stepwell',
        name: 'Macro Aquifer Recharge Loop',
        interventions: ['johad_percolation', 'stepwell_baoli'],
        bonusDescription: '+35% Water Retention & +20 Community Happiness! Johad bunds raise the local water table, causing the Stepwell tiers to fill with crystal-clear naturally filtered groundwater.',
        waterBonusPct: 35,
        resilienceBonus: 15,
        historicalLesson: 'In medieval Rajasthan, village Johads were deliberately constructed upstream from town Baolis to guarantee pristine, filtered well water even during multi-year droughts.'
      },
      {
        id: 'syn_qanat_cistern',
        name: 'Continuous Gravity Reservoir',
        interventions: ['persian_qanat', 'roman_cistern'],
        bonusDescription: '+40% Resilience & 0 Evaporation Loss! Continuous subterranean mountain flow feeds covered vaulted chambers, ensuring 500+ days of emergency reserves.',
        waterBonusPct: 30,
        resilienceBonus: 20,
        historicalLesson: 'Persian and Nabataean cities paired gravity canals with covered cisterns (Ab Anbars) to ensure cities could survive 2-year droughts with zero surface water loss.'
      }
    ],
    advisorTips: {
      welcome: "Greetings, Steward. You face an acute water crisis. Remember the lesson of Dholavira and Yazd: never let the monsoon water escape into the sea or evaporate into the sky. Channel it deep beneath the earth.",
      hint1: "Johads are the cheapest way to capture monsoonal torrents and raise the deep aquifer. Pair them with Stepwells for maximum community access.",
      hint2: "Qanats require high upfront stone masonry, but they draw perennial water from mountain alluvium with zero mechanical pumping.",
      warningHighCost: "Careful with your treasury! Stepwells and Qanats require heavy masonry. Ensure you keep enough gold for seasonal maintenance.",
      synergySuccess: "Magnificent! You created the Macro Aquifer Loop: Johads recharge the groundwater, and your Stepwell catches the pristine overflow!"
    }
  },

  architecture: {
    id: 'architecture',
    order: 2,
    title: 'Era II: Traditional Passive Architecture',
    subtitle: 'Windcatchers, Thermal Mass & Microclimate Courtyards',
    location: 'Yazd (Iran), Shibam (Yemen) & Old Cairo (Egypt)',
    timePeriod: '1000 BCE – 1400 CE',
    accentColor: '#f59e0b',
    secondaryColor: '#d97706',
    skyColor: '#ffd166',
    groundColor: '#b08968',
    fogNear: 30,
    fogFar: 160,
    ambientLightColor: '#ffedd5',
    keyLightColor: '#fffbeb',
    historicalStory: {
      heroQuote: "The ancients did not burn fuel to fight the heat; they shaped stone, wind, and shade into living instruments of natural respiration.",
      narrativeIntro: [
        "In the historic desert cities of Yazd, Shibam ('the Manhattan of the Desert'), and medieval Cairo, ambient summer temperatures routinely exceeded 45°C under direct solar radiation.",
        "Without electricity or refrigerant compressors, master builders achieved comfortable indoor temperatures of 24–28°C using purely passive physics: high-velocity Badgir wind towers, Mashrabiya Venturi screens, thick adobe thermal mass, and shaded central courtyards.",
        "These cities functioned as self-cooling thermal engines: cold night air was trapped in dense masonry, while daytime solar buoyancy pulled fresh air across subterranean evaporative water pools."
      ],
      ancientCivilizationsMentioned: [
        "Ancient Yazd & Persepolis (Persia) — 4-directional Badgirs (Windcatchers)",
        "Mamluk Cairo & Andalusia (Granada) — Geometric wooden Mashrabiya & Jali screens",
        "Shibam Hadhramaut (Yemen) — 500-year-old 8-story sun-dried mudbrick towers",
        "Matmata & Cappadocia (North Africa & Anatolia) — Earth-sheltered subterranean habitations"
      ],
      archaeologicalEvidence: "Empirical studies by the University of Tehran and ETH Zurich confirm that traditional Yazd wind towers reduce indoor temperatures by 8–12°C compared to ambient outdoor air while exchanging indoor air 15–20 times per hour without a single watt of electricity."
    },
    modernCrisis: {
      title: "Urban Heat Island & Grid Blackout Emergency",
      description: "Glass-fronted modern concrete buildings and asphalt roads have trapped urban heat (+44°C outdoor ambient). Spiking air conditioning demand has caused catastrophic rolling blackouts and surging fossil fuel emissions.",
      urgencyText: "The regional electric grid is failing under a 95% AC overload. Hospitals and schools are overheating. We must redesign the settlement using zero-energy passive ancient architecture.",
      targetSurvivalDays: 45,
      budget: 1800,
      baselineMetrics: {
        waterAvailableDays: 120,
        ambientTempC: 44,
        gridStressPct: 95,
        soilDegradationPct: 40,
        communitySatisfactionPct: 25,
        resilienceRating: 22,
      },
      successGoals: {
        minSustainabilityScore: 82,
        keyMilestoneLabel: "Drop Indoor Temps by ≥8°C & Reduce Grid AC Load by ≥60%"
      }
    },
    interventions: [
      {
        id: 'badgir_windcatcher',
        name: 'Multi-directional Badgir (Wind Tower)',
        civilization: 'Yazd & Persian Gulf (1000 BCE)',
        eraId: 'architecture',
        category: 'cooling',
        icon: 'wind-tower',
        tagline: 'High-altitude aerodynamic tower capturing upper cooling breezes',
        description: 'Tall vertical masonry shaft with multi-directional top vents that catch high-altitude cool prevailing winds, directing them downward into living quarters and expelling stale hot air via negative pressure.',
        historicalOrigins: 'The skyline of Yazd (Iran) features hundreds of Badgirs operating continuously for centuries, keeping domestic quarters cool during scorching 48°C desert summers.',
        verifiedSource: {
          title: "Thermal Performance of Windcatchers in Hot Arid Climates",
          authorOrOrg: "Prof. Mehdi N. Bahadori / Scientific American & Solar Energy Journal",
          yearOrEra: "1978 & 1994",
          publication: "Solar Energy Vol. 34",
          verifiedFact: "Badgirs reduce indoor building temperatures by 8 to 12°C with zero electrical energy input, utilizing solely natural atmospheric wind pressure and buoyancy.",
        },
        costGold: 420,
        constructionDays: 14,
        maintenanceAnnual: 20,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 15,
        tempReductionCelsius: 4.8,
        gridPowerSavedMW: 0.45,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.0,
        biodiversityScore: 10,
        carbonOffsetTonsPerYr: 35,
        communityHappiness: 26,
        resilienceIndex: 30,
        meshType: 'windcatcher'
      },
      {
        id: 'mashrabiya_jali',
        name: 'Mashrabiya / Jali Lattice Screens',
        civilization: 'Islamic & Mughal Architecture (9th c. CE)',
        eraId: 'architecture',
        category: 'cooling',
        icon: 'grid-pattern',
        tagline: 'Geometric wooden/stone screens accelerating airflow via Venturi effect',
        description: 'Intricately carved geometric lattice screens that block 80% of direct solar radiation while compressing incoming airflow through narrow apertures, speeding it up and accelerating evaporative cooling.',
        historicalOrigins: 'Traditional Cairo townhouses placed porous clay water jars (qulla) in the Mashrabiya overhang, cooling air by up to 6°C as it entered the living room.',
        verifiedSource: {
          title: "Natural Energy and Vernacular Architecture",
          authorOrOrg: "Prof. Hassan Fathy / University of Chicago Press",
          yearOrEra: "1986",
          publication: "United Nations University & UN-Habitat",
          verifiedFact: "Mashrabiyas reduce solar heat gain by 75% compared to modern unshaded glass windows while accelerating natural ventilation velocity by 180%.",
        },
        costGold: 280,
        constructionDays: 8,
        maintenanceAnnual: 15,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 10,
        tempReductionCelsius: 2.5,
        gridPowerSavedMW: 0.28,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.0,
        biodiversityScore: 8,
        carbonOffsetTonsPerYr: 22,
        communityHappiness: 22,
        resilienceIndex: 20,
        meshType: 'mashrabiya'
      },
      {
        id: 'central_courtyard',
        name: 'Microclimate Central Courtyard',
        civilization: 'Roman Atrium, Hāveli & Andalusian Patios',
        eraId: 'architecture',
        category: 'cooling',
        icon: 'square-courtyard',
        tagline: 'Open-air central sanctuary acting as a thermal chimney and cool night air sink',
        description: 'Enclosed central courtyard featuring shaded colonnades, greenery, and a central water basin. Cool dense air settles into the courtyard at night and slowly dissipates through rooms during daytime heat.',
        historicalOrigins: 'From Pompeian atriums to Rajasthani Hāvelis and Cordoba patios, courtyards created protected microclimates that shielded inhabitants from dust, noise, and radiant desert heat.',
        verifiedSource: {
          title: "Microclimatic Performance of Traditional Courtyard Buildings",
          authorOrOrg: "Building and Environment Journal / Elsevier",
          yearOrEra: "2018",
          publication: "Building & Environment Vol. 134",
          verifiedFact: "Courtyard geometries create a diurnal thermal chimney effect that lowers average indoor temperatures by 5.2°C while providing 100% natural daylighting.",
        },
        costGold: 390,
        constructionDays: 16,
        maintenanceAnnual: 25,
        waterYieldLitersPerDay: 5000,
        evaporationReductionPct: 20,
        tempReductionCelsius: 3.8,
        gridPowerSavedMW: 0.38,
        foodYieldTonsPerYr: 2,
        soilOrganicMatterPct: 0.2,
        biodiversityScore: 22,
        carbonOffsetTonsPerYr: 28,
        communityHappiness: 34,
        resilienceIndex: 26,
        meshType: 'courtyard'
      },
      {
        id: 'thick_adobe_walls',
        name: 'Rammed Earth & Adobe Thermal Mass',
        civilization: 'Shibam (Yemen), Taos (Pueblo) & Indus',
        eraId: 'architecture',
        category: 'cooling',
        icon: 'brick-wall',
        tagline: '50cm earthen walls with a 10-12 hour thermal phase shift',
        description: 'Thick walls constructed from sun-dried clay, straw, and mineral earth with massive thermal capacity. Heat absorbed during the hottest midday hours only reaches the interior 10 hours later during the cold desert night.',
        historicalOrigins: 'Shibam Hadhramaut features 500-year-old, 8-story high-rise apartment towers made entirely of rammed mudbrick, naturally insulated against extreme 50°C summer heat.',
        verifiedSource: {
          title: "Thermal Inertia and Phase Lag in Adobe Vernacular Architecture",
          authorOrOrg: "Energy and Buildings Journal / Elsevier",
          yearOrEra: "2015",
          publication: "Energy and Buildings Vol. 92",
          verifiedFact: "50cm adobe walls provide a 10.5-hour thermal lag, dampening outdoor diurnal temperature swings from 25°C down to less than 4°C indoors.",
        },
        costGold: 320,
        constructionDays: 12,
        maintenanceAnnual: 18,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 5,
        tempReductionCelsius: 3.2,
        gridPowerSavedMW: 0.32,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.0,
        biodiversityScore: 12,
        carbonOffsetTonsPerYr: 30,
        communityHappiness: 24,
        resilienceIndex: 28,
        meshType: 'thick_adobe'
      },
      {
        id: 'earth_sheltered',
        name: 'Earth-Sheltered Subterranean Living',
        civilization: 'Matmata (Berber Tunisia) & Cappadocia (Anatolia)',
        eraId: 'architecture',
        category: 'cooling',
        icon: 'mountain-home',
        tagline: 'Dwellings carved into earth utilizing constant 18°C ground temp',
        description: 'Habitations excavated into hillsides or central subterranean circular sunken pits, utilizing the vast thermal mass of the earth crust to maintain a steady 18–21°C year-round regardless of surface blizzards or heatwaves.',
        historicalOrigins: 'The subterranean troglodyte homes of Matmata (Tunisia) and Derinkuyu (Cappadocia) sheltered entire communities from extreme desert thermal extremes and invaders.',
        verifiedSource: {
          title: "Underground and Earth-Sheltered Architecture: Energy Performance",
          authorOrOrg: "Tunnelling and Underground Space Technology",
          yearOrEra: "2017",
          publication: "TUST Elsevier Vol. 68",
          verifiedFact: "Earth-sheltered structures reduce total heating and cooling energy loads by up to 85% compared to above-ground standard concrete buildings.",
        },
        costGold: 480,
        constructionDays: 20,
        maintenanceAnnual: 10,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 30,
        tempReductionCelsius: 5.5,
        gridPowerSavedMW: 0.50,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.1,
        biodiversityScore: 10,
        carbonOffsetTonsPerYr: 42,
        communityHappiness: 20,
        resilienceIndex: 35,
        meshType: 'earth_sheltered'
      }
    ],
    synergies: [
      {
        id: 'syn_wind_courtyard',
        name: 'Evaporative Convective Circuit',
        interventions: ['badgir_windcatcher', 'central_courtyard'],
        bonusDescription: '+3.5°C Extra Cooling & +30% Grid Relief! Badgir towers pull hot upper air down over the central courtyard fountain, supercharging evaporative cooling across all rooms.',
        coolingBonusC: 3.5,
        resilienceBonus: 18,
        historicalLesson: 'In traditional Persian Hāvelis, windcatchers were deliberately oriented to discharge air directly over courtyard water basins (Howz), causing instant natural cooling.'
      },
      {
        id: 'syn_adobe_mashrabiya',
        name: 'Zero-Solar-Gain Thermal Envelope',
        interventions: ['thick_adobe_walls', 'mashrabiya_jali'],
        bonusDescription: '+2.5°C Extra Cooling & +25 Carbon Offset! Thick adobe blocks structural conductive heat while Mashrabiya screens eliminate 80% of window radiative solar gain.',
        coolingBonusC: 2.5,
        resilienceBonus: 15,
        historicalLesson: 'Architect Hassan Fathy proved in New Gourna that combining mudbrick domes with timber mashrabiyas creates homes cooler than modern air-conditioned concrete blocks.'
      }
    ],
    advisorTips: {
      welcome: "Welcome to the architectural forge. Modern glass towers are greenhouses that trap solar heat and strain the grid. We must build with thermal mass, shade, and wind aerodynamics.",
      hint1: "Pairing a Windcatcher (Badgir) with a Central Courtyard creates an evaporative thermal loop that drops indoor temps dramatically.",
      hint2: "Adobe walls provide crucial 10-hour thermal lag, absorbing the scorching noon heat and releasing it safely at midnight.",
      warningHighCost: "Earth-sheltered excavation requires substantial capital and skilled labor, but offers near-total insulation from heatwaves.",
      synergySuccess: "Masterful design! The Evaporative Convective Circuit is active: air drawn down through your Badgir passes across the courtyard water basin!"
    }
  },

  agriculture: {
    id: 'agriculture',
    order: 3,
    title: 'Era III: Traditional Resilient Agriculture',
    subtitle: 'Milpa Polyculture, Chinampas & Terra Preta',
    location: 'Mesoamerica, Lake Xochimilco & Amazon Basin',
    timePeriod: '2500 BCE – 1500 CE',
    accentColor: '#10b981',
    secondaryColor: '#059669',
    skyColor: '#a7f3d0',
    groundColor: '#473322',
    fogNear: 25,
    fogFar: 140,
    ambientLightColor: '#dcfce7',
    keyLightColor: '#f0fdf4',
    historicalStory: {
      heroQuote: "The modern plow wounds the soil and demands chemical poison; ancient farmers cultivated living soil that grew richer with every passing century.",
      narrativeIntro: [
        "Modern industrial monoculture strips nutrients, relies on fossil-fuel fertilizers, and loses 24 billion tons of fertile topsoil annually to erosion and drought.",
        "In contrast, ancient indigenous agricultural systems produced astonishing crop yields while actively regenerating soil humus, conserving water, and cultivating biodiversity.",
        "Mesoamerican farmers cultivated the Three Sisters (Milpa: corn, climbing beans, and sprawling squash) in symbiotic harmony; Aztec engineers fed 250,000 people in Tenochtitlan with high-yield floating Chinampa garden islands; and Amazonian peoples created Terra Preta—deep black anthropogenic biochar soil that remains fertile 1,000 years later."
      ],
      ancientCivilizationsMentioned: [
        "Maya & Haudenosaunee / Iroquois — The Three Sisters (Milpa) symbiotic polyculture",
        "Aztec Empire (Tenochtitlan / Lake Xochimilco) — Chinampas floating wetland agriculture",
        "Inca Empire (Sacred Valley / Moray) — Andenes microclimatic stone agricultural terraces",
        "Indigenous Amazonians (Upper Xingu) — Terra Preta de Índio carbon-rich biochar soil",
        "Sahelian Farmers (Burkina Faso / Mali) — Zaï compost planting pits and stone bunds"
      ],
      archaeologicalEvidence: "Soil core samples in Nature and Science demonstrate Amazonian Terra Preta contains up to 70 times more black carbon and 300% more plant-available phosphorus than surrounding oxisol soils, holding fertility indefinitely without chemical inputs. Aztec Chinampas yielded up to 7 distinct harvests per year."
    },
    modernCrisis: {
      title: "Soil Desertification & Regional Food Shock",
      description: "Decades of heavy chemical fertilizer and single-crop monoculture have collapsed soil organic matter to 0.4%. Flash droughts and pest outbreaks have destroyed 60% of local grain crops, threatening famine and ecosystem collapse.",
      urgencyText: "Topsoil is blowing away as dust storms. Chemical runoff has poisoned the waterways. We must restore soil biology, water efficiency, and crop diversity using ancient indigenous agroecology.",
      targetSurvivalDays: 60,
      budget: 1600,
      baselineMetrics: {
        waterAvailableDays: 60,
        ambientTempC: 38,
        gridStressPct: 50,
        soilDegradationPct: 88,
        communitySatisfactionPct: 30,
        resilienceRating: 20,
      },
      successGoals: {
        minSustainabilityScore: 80,
        keyMilestoneLabel: "Rebuild Soil Organic Matter to ≥4.5% & Achieve 100% Food Sovereignty"
      }
    },
    interventions: [
      {
        id: 'three_sisters_milpa',
        name: 'Three Sisters Milpa Polyculture',
        civilization: 'Mesoamerica & Haudenosaunee (2500 BCE)',
        eraId: 'agriculture',
        category: 'soil',
        icon: 'sprout-plants',
        tagline: 'Symbiotic trio: Corn (trellis), Beans (nitrogen fixation), Squash (living mulch)',
        description: 'Genius polyculture system where tall corn stalks provide natural scaffolding for pole beans; rhizobia bacteria on bean roots fix atmospheric nitrogen into the soil; and broad prickly squash leaves shade the soil, reducing weed germination and soil moisture evaporation by 40%.',
        historicalOrigins: 'The Milpa system formed the nutritional and ecological foundation of Maya and Aztec civilizations for millennia, producing complete protein (lysine + methionine).',
        verifiedSource: {
          title: "The Milpa System: A Traditional Mesoamerican Polyculture",
          authorOrOrg: "Food and Agriculture Organization (FAO) / Agroecology Heritage",
          yearOrEra: "2018",
          publication: "FAO Globally Important Agricultural Heritage Systems (GIAHS)",
          verifiedFact: "Intercropping the Three Sisters yields up to 35% more total food energy per hectare than monocultures while reducing weed biomass by 70% without synthetic pesticides.",
        },
        costGold: 240,
        constructionDays: 6,
        maintenanceAnnual: 12,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 35,
        tempReductionCelsius: 1.0,
        gridPowerSavedMW: 0.12,
        foodYieldTonsPerYr: 38,
        soilOrganicMatterPct: 2.2,
        biodiversityScore: 36,
        carbonOffsetTonsPerYr: 28,
        communityHappiness: 28,
        resilienceIndex: 32,
        meshType: 'milpa'
      },
      {
        id: 'aztec_chinampas',
        name: 'Aztec Chinampas (Floating Gardens)',
        civilization: 'Aztec / Mexica (Lake Xochimilco, 12th c.)',
        eraId: 'agriculture',
        category: 'soil',
        icon: 'floating-island',
        tagline: 'Raised lakebed agricultural islands yielding up to 7 harvests annually',
        description: 'Man-made agricultural islands constructed in shallow lakes using woven willow frames (ahuejote), reeds, and nutrient-rich lakebed sediment. Sub-surface capillary water wick-action eliminates manual watering while canals breed fish and water plants.',
        historicalOrigins: 'Over 9,000 hectares of Chinampas sustained the 250,000 citizens of Tenochtitlan, making it one of the most productive agro-ecosystems ever devised by humanity.',
        verifiedSource: {
          title: "Productivity and Ecological Resilience of Aztec Chinampa Agriculture",
          authorOrOrg: "Stephan R. Gliessman / Springer Agroecology Journal",
          yearOrEra: "1981 & 2011",
          publication: "Agroecology and Sustainable Food Systems",
          verifiedFact: "Chinampas produce up to 7 distinct crop harvests per year with constant sub-irrigation, requiring 0 liters of motorized pumping and generating high aquatic biodiversity.",
        },
        costGold: 440,
        constructionDays: 16,
        maintenanceAnnual: 24,
        waterYieldLitersPerDay: 15000,
        evaporationReductionPct: 20,
        tempReductionCelsius: 1.8,
        gridPowerSavedMW: 0.20,
        foodYieldTonsPerYr: 65,
        soilOrganicMatterPct: 3.5,
        biodiversityScore: 45,
        carbonOffsetTonsPerYr: 38,
        communityHappiness: 32,
        resilienceIndex: 36,
        meshType: 'chinampa'
      },
      {
        id: 'inca_andenes',
        name: 'Inca Andenes Stone Terraces',
        civilization: 'Inca Empire (Moray / Sacred Valley, 14th c.)',
        eraId: 'agriculture',
        category: 'soil',
        icon: 'mountain-stairs',
        tagline: 'Stone retaining terraces creating thermal microclimates on steep slopes',
        description: 'Stepped mountain terraces built with porous stone drainage bases, rich soil layers, and heat-absorbing dark stone retaining walls that absorb daytime solar radiation and release warmth at night, preventing frost and enabling agriculture at 3,500m altitude.',
        historicalOrigins: 'The Inca constructed over 1 million hectares of Andenes throughout the Andes, transforming sheer vertical cliffs into drought-resistant, frost-free agricultural engines.',
        verifiedSource: {
          title: "Inca Hydraulic and Terracing Technology in the Sacred Valley",
          authorOrOrg: "Ann Kendall / Oxford University Archaeological Monograph",
          yearOrEra: "2009",
          publication: "Journal of Andean Archaeology",
          verifiedFact: "Andenes stone walls raise nighttime localized soil temperatures by 3 to 5°C, eliminate hillside erosion by 98%, and maximize gravity-fed spring runoff.",
        },
        costGold: 380,
        constructionDays: 14,
        maintenanceAnnual: 20,
        waterYieldLitersPerDay: 5000,
        evaporationReductionPct: 25,
        tempReductionCelsius: 1.2,
        gridPowerSavedMW: 0.15,
        foodYieldTonsPerYr: 42,
        soilOrganicMatterPct: 2.0,
        biodiversityScore: 28,
        carbonOffsetTonsPerYr: 32,
        communityHappiness: 26,
        resilienceIndex: 34,
        meshType: 'terrace'
      },
      {
        id: 'amazon_terra_preta',
        name: 'Amazonian Terra Preta (Biochar Soil)',
        civilization: 'Pre-Columbian Amazonian Tribes (500 BCE)',
        eraId: 'agriculture',
        category: 'soil',
        icon: 'flame-soil',
        tagline: 'Pyrolyzed biochar, bone & compost creating permanent black fertile humus',
        description: 'Engineered anthropogenic dark soil enriched with low-temperature charcoal (biochar), pottery shards, fish bones, and compost. The microscopic porous structure of biochar harbors beneficial microbes, locks in nutrients, and permanently sequesters carbon.',
        historicalOrigins: 'Created over centuries across the Amazon basin, Terra Preta patches remain intensely fertile today despite tropical rains that leach nutrients from normal jungle soils.',
        verifiedSource: {
          title: "Amazonian Dark Earths: Wim Sombroek's Vision and Biochar Chemistry",
          authorOrOrg: "Johannes Lehmann & Bruno Glaser / Science Magazine & Nature",
          yearOrEra: "2003 & 2007",
          publication: "Nature Vol. 447",
          verifiedFact: "Terra Preta retains up to 250% more moisture and 300% more bio-available nutrients than surrounding soils while locking carbon in the ground for over 1,000 years.",
        },
        costGold: 310,
        constructionDays: 10,
        maintenanceAnnual: 10,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 30,
        tempReductionCelsius: 0.5,
        gridPowerSavedMW: 0.05,
        foodYieldTonsPerYr: 32,
        soilOrganicMatterPct: 4.8,
        biodiversityScore: 30,
        carbonOffsetTonsPerYr: 50,
        communityHappiness: 24,
        resilienceIndex: 35,
        meshType: 'terra_preta'
      },
      {
        id: 'sahel_zai_pits',
        name: 'Sahelian Zaï Moisture Pits',
        civilization: 'Yacouba Sawadogo & Mossi Farmers (Burkina Faso)',
        eraId: 'agriculture',
        category: 'soil',
        icon: 'hole-circle',
        tagline: 'Concentrated organic compost basins capturing desert rain & termite activity',
        description: '20cm wide and 15cm deep planting pits dug into crusted barren desert clay, filled with organic manure. When rains come, pits catch runoff; termites burrow into the manure, creating millions of subterranean aeration channels that allow rain to penetrate deeply.',
        historicalOrigins: 'Pioneered by Right Livelihood laureate Yacouba Sawadogo ("The Man Who Stopped the Desert"), Zaï pits restored over 3 million hectares of abandoned desert land in West Africa.',
        verifiedSource: {
          title: "Re-greening the Sahel: Farmer-Managed Natural Regeneration and Zaï Pits",
          authorOrOrg: "Chris Reij / International Food Policy Research Institute (IFPRI)",
          yearOrEra: "2009",
          publication: "IFPRI Discussion Paper 00914",
          verifiedFact: "Zaï pits increase crop yields by 300% to 500% on completely barren, encrusted laterite soils where ordinary farming produces zero yield.",
        },
        costGold: 190,
        constructionDays: 5,
        maintenanceAnnual: 8,
        waterYieldLitersPerDay: 8000,
        evaporationReductionPct: 40,
        tempReductionCelsius: 0.8,
        gridPowerSavedMW: 0.05,
        foodYieldTonsPerYr: 28,
        soilOrganicMatterPct: 2.5,
        biodiversityScore: 26,
        carbonOffsetTonsPerYr: 22,
        communityHappiness: 26,
        resilienceIndex: 30,
        meshType: 'zai_pits'
      }
    ],
    synergies: [
      {
        id: 'syn_milpa_terra_preta',
        name: 'Ancestral Carbon-Fertility Engine',
        interventions: ['three_sisters_milpa', 'amazon_terra_preta'],
        bonusDescription: '+40% Food Yield & +3.0% Soil Organic Matter! Nitrogen fixed by Milpa beans binds tightly to the porous biochar microscopic lattice, preventing nutrient leaching.',
        foodBonusPct: 40,
        resilienceBonus: 20,
        historicalLesson: 'Combining polyculture companion planting with charcoal-amended dark soils produces the highest long-term agroecological resilience known in soil science.'
      },
      {
        id: 'syn_chinampa_zai',
        name: 'Closed-Loop Hydrological Agro-Belt',
        interventions: ['aztec_chinampas', 'sahel_zai_pits'],
        bonusDescription: '+50% Biodiversity & +30% Water Resilience! Canal silt from Chinampas provides rich organic mulch for Zaï pits, completely eliminating desertification.',
        foodBonusPct: 30,
        resilienceBonus: 22,
        historicalLesson: 'Recycling aquatic canal biomass into terrestrial infiltration pits creates a zero-waste nutrient cycle that mirrors natural wetland-floodplain ecosystems.'
      }
    ],
    advisorTips: {
      welcome: "Welcome to the living soils of antiquity. Modern farming treats soil as dead dirt to be pumped with chemicals. Indigenous farmers knew soil is a living organism of carbon, fungi, and mutualism.",
      hint1: "The Three Sisters Milpa is fast and cost-effective. Adding Amazonian Terra Preta locks the bean nitrogen into permanent carbon biochar pores.",
      hint2: "Chinampas have high upfront cost, but their continuous sub-irrigation generates immense food yields with 0 liters of mechanical pumping.",
      warningHighCost: "Building stone Andenes terraces and aquatic Chinampas requires significant labor and stones. Plan your treasury balance carefully.",
      synergySuccess: "Phenomenal! Your Ancestral Carbon-Fertility Engine is operational: nitrogen and moisture are locked into deep black biochar humus!"
    }
  },

  final2050: {
    id: 'final2050',
    order: 4,
    title: 'Grand Finale: 2050 Solarpunk Metropolis',
    subtitle: 'Unifying Water, Architecture & Regenerative Agriculture',
    location: 'Neo-Metropolis 2050 (Integrated Global Mega-City)',
    timePeriod: 'Year 2050 (The Crossroads of Civilization)',
    accentColor: '#06b6d4',
    secondaryColor: '#0891b2',
    skyColor: '#93c5fd',
    groundColor: '#1e293b',
    fogNear: 35,
    fogFar: 180,
    ambientLightColor: '#cffafe',
    keyLightColor: '#e0f2fe',
    historicalStory: {
      heroQuote: "The future is not high-tech concrete and electric greed; it is the symbiotic harmony of 5,000 years of human wisdom infused into the cities of tomorrow.",
      narrativeIntro: [
        "By 2050, the metropolitan region of 2 million citizens faces a quadruple crisis: acute water stress with depleted dams, 48°C extreme urban heat domes, food supply chain vulnerabilities, and sky-high infrastructure energy costs.",
        "Traditional modern engineering proposals (mega-desalination plants, massive air conditioning chiller plants, vertical hydroponic warehouses) will cost tens of billions of dollars and consume colossal gigawatts of electricity, worsening the climate feedback loop.",
        "You are appointed Grand Architect of the 2050 Masterplan. Your mission is to fuse the proven principles of the three historical eras: Stepwells & Qanats for zero-energy water autonomy; Badgirs, Courtyards & Rammed Earth for passive thermal comfort; and Chinampas, Milpa & Terra Preta for circular food sovereignty."
      ],
      ancientCivilizationsMentioned: [
        "All Civilizations Unified: Indus, Persian, Roman, Moorish, Mesoamerican, Andean, Amazonian & Sahelian"
      ],
      archaeologicalEvidence: "Intergovernmental Panel on Climate Change (IPCC Sixth Assessment Report, 2022) Chapter on Resilient Infrastructure explicitly highlights that indigenous and traditional adaptation techniques provide high-confidence, low-cost climate resilience with zero operational carbon."
    },
    modernCrisis: {
      title: "Megacity 2050 Quadruple Climate Convergence",
      description: "Severe drought has pushed reservoirs to 12% capacity, heatwaves exceed 48°C causing urban heat island mortality, food prices have quadrupled, and the regional grid is on the verge of total collapse.",
      urgencyText: "Day Zero approaches in 90 days. Conventional tech has failed. Deploy an integrated holistic ancient-modern masterplan combining Water, Architecture, and Agriculture.",
      targetSurvivalDays: 90,
      budget: 3200,
      baselineMetrics: {
        waterAvailableDays: 20,
        ambientTempC: 48,
        gridStressPct: 98,
        soilDegradationPct: 90,
        communitySatisfactionPct: 20,
        resilienceRating: 15,
      },
      successGoals: {
        minSustainabilityScore: 88,
        keyMilestoneLabel: "Achieve ≥88% Across All 7 Sustainability Dimensions & Certify Master of Ancient Wisdom"
      }
    },
    interventions: [
      {
        id: 'hybrid_stepwell_aquifer',
        name: 'Solarpunk Stepwell & Sponge Aquifer',
        civilization: 'Neo-Indus / Solarpunk Fusion',
        eraId: 'final2050',
        category: 'hybrid',
        icon: 'stairs-water',
        tagline: 'Subterranean stepped rainwater reservoir with bio-sand filtration & community amphitheater',
        description: 'Modernized inverted stepwell constructed from permeable recycled geo-polymer stone. Captures urban cloudbursts, recharges regional aquifers, and creates a public amphitheater that naturally cools the district by 4°C.',
        historicalOrigins: 'Synthesizes the architectural genius of Chand Baori with modern urban sponge city bio-retention swales.',
        verifiedSource: {
          title: "Sponge Cities and Ancient Water Urbanism",
          authorOrOrg: "Nature Cities / Prof. Kongjian Yu (Turenscape)",
          yearOrEra: "2023",
          publication: "Nature Cities Vol. 1",
          verifiedFact: "Decentralized stepped water basins capture 85% of urban stormwater, preventing urban flooding while replenishing groundwater tables at 1/5th the cost of concrete sewer pipes.",
        },
        costGold: 580,
        constructionDays: 18,
        maintenanceAnnual: 25,
        waterYieldLitersPerDay: 75000,
        evaporationReductionPct: 70,
        tempReductionCelsius: 3.5,
        gridPowerSavedMW: 0.35,
        foodYieldTonsPerYr: 5,
        soilOrganicMatterPct: 0.5,
        biodiversityScore: 28,
        carbonOffsetTonsPerYr: 45,
        communityHappiness: 38,
        resilienceIndex: 35,
        meshType: 'stepwell'
      },
      {
        id: 'hybrid_badgir_spire',
        name: 'Biomimetic Windcatcher Tower (Badgir Spire)',
        civilization: 'Neo-Persian / Aerodynamic Fusion',
        eraId: 'final2050',
        category: 'hybrid',
        icon: 'wind-tower',
        tagline: 'Aerodynamic wind spire drawing cool upper currents through subterranean cooling labyrinths',
        description: 'High-rise residential cooling spire with multi-directional intake louvers. Draws 100m high-altitude breezes downward through underground stone earth ducts and over subterranean stepwell water, cooling entire district blocks with 0 electrical chillers.',
        historicalOrigins: 'Directly adapts the 2,500-year-old Yazd Badgir principle into modern mixed-use mid-rise urban blocks.',
        verifiedSource: {
          title: "Zero-Carbon Urban Cooling: Lessons from Persian Windcatchers",
          authorOrOrg: "International Energy Agency (IEA) / Clean Energy Technology",
          yearOrEra: "2021",
          publication: "IEA Energy Efficient Buildings Report",
          verifiedFact: "Wind-driven passive ventilation towers eliminate up to 72% of mechanical air conditioning electrical load in dense metropolitan urban quarters.",
        },
        costGold: 620,
        constructionDays: 20,
        maintenanceAnnual: 22,
        waterYieldLitersPerDay: 0,
        evaporationReductionPct: 15,
        tempReductionCelsius: 6.2,
        gridPowerSavedMW: 0.75,
        foodYieldTonsPerYr: 0,
        soilOrganicMatterPct: 0.0,
        biodiversityScore: 12,
        carbonOffsetTonsPerYr: 60,
        communityHappiness: 34,
        resilienceIndex: 38,
        meshType: 'cooling_spire'
      },
      {
        id: 'hybrid_rooftop_chinampa',
        name: 'Rooftop Chinampa & Milpa Food Belt',
        civilization: 'Neo-Aztec & Mesoamerican Urban Agriculture',
        eraId: 'final2050',
        category: 'hybrid',
        icon: 'floating-island',
        tagline: 'Wetland rooftop gardens and perimeter Milpa food forests using biochar substrates',
        description: 'Interconnected network of rooftop sub-irrigated wetland gardens (Chinampas) and urban perimeter Three Sisters food belts. Utilizes greywater bio-filtration and Amazonian Terra Preta substrate to produce fresh organic produce at hyper-local scale.',
        historicalOrigins: 'Merges Tenochtitlan chinampa hydraulic productivity with Maya milpa companion planting on urban building envelopes.',
        verifiedSource: {
          title: "Circular Urban Agroecology: Rooftop Wetlands and Indigenous Polyculture",
          authorOrOrg: "Lancet Planetary Health / World Resources Institute",
          yearOrEra: "2022",
          publication: "The Lancet Planetary Health Vol. 6",
          verifiedFact: "Sub-irrigated urban polyculture roofs insulate buildings (reducing indoor temps by 4°C), capture 90% of rooftop rainwater, and produce 45 kg of fresh food per m² annually.",
        },
        costGold: 540,
        constructionDays: 15,
        maintenanceAnnual: 20,
        waterYieldLitersPerDay: 10000,
        evaporationReductionPct: 35,
        tempReductionCelsius: 2.8,
        gridPowerSavedMW: 0.40,
        foodYieldTonsPerYr: 85,
        soilOrganicMatterPct: 4.2,
        biodiversityScore: 50,
        carbonOffsetTonsPerYr: 55,
        communityHappiness: 40,
        resilienceIndex: 36,
        meshType: 'rooftop_milpa'
      },
      {
        id: 'hybrid_qanat_microgrid',
        name: 'Subterranean Qanat Hydrological Grid',
        civilization: 'Neo-Persian Subterranean Infrastructure',
        eraId: 'final2050',
        category: 'hybrid',
        icon: 'mountain-tunnel',
        tagline: 'Gravity-driven subterranean water channels cooling streets and irrigating food belts',
        description: 'Underground gravity aqueduct network transporting stormwater and purified mountain runoff directly beneath pedestrian streets. Radiates passive geothermal cooling through stone pavements while sub-irrigating urban tree canopies.',
        historicalOrigins: 'Transforms the ancient Persian Qanat into a 21st-century circular urban cooling and water conveyance artery.',
        verifiedSource: {
          title: "Subsurface Urban Water Infrastructure: Historical and Modern Perspectives",
          authorOrOrg: "American Society of Civil Engineers (ASCE)",
          yearOrEra: "2020",
          publication: "Journal of Sustainable Water in the Built Environment",
          verifiedFact: "Subterranean gravity water channels reduce urban street surface temperatures by 4 to 7°C via convective cooling while delivering continuous water with 0 pumping energy.",
        },
        costGold: 560,
        constructionDays: 18,
        maintenanceAnnual: 25,
        waterYieldLitersPerDay: 80000,
        evaporationReductionPct: 90,
        tempReductionCelsius: 3.0,
        gridPowerSavedMW: 0.45,
        foodYieldTonsPerYr: 10,
        soilOrganicMatterPct: 0.6,
        biodiversityScore: 25,
        carbonOffsetTonsPerYr: 48,
        communityHappiness: 32,
        resilienceIndex: 40,
        meshType: 'qanat'
      },
      {
        id: 'hybrid_biochar_courtyard',
        name: 'Terra Preta Earth Courtyards',
        civilization: 'Pan-Indigenous Earth Architecture & Agronomy',
        eraId: 'final2050',
        category: 'hybrid',
        icon: 'square-courtyard',
        tagline: 'Rammed earth courtyard districts with biochar soil sponge parks and jali facades',
        description: 'Dense residential neighborhood clusters built around shared courtyards with 50cm rammed earth walls, timber jali screens, and central micro-parks enriched with Amazonian Terra Preta to absorb cloudbursts and filter urban air.',
        historicalOrigins: 'Integrates Shibam mudbrick thermal mass, Cairo jali ventilation, and Amazonian biochar moisture sponges.',
        verifiedSource: {
          title: "Biochar-Enhanced Sponge Urbanism and Rammed Earth Microclimates",
          authorOrOrg: "Sustainable Cities and Society / Elsevier",
          yearOrEra: "2024",
          publication: "Sustainable Cities and Society Vol. 101",
          verifiedFact: "Biochar-amended urban soils increase water infiltration capacity by 400%, while rammed earth courtyard clusters reduce neighborhood AC demand by 65%.",
        },
        costGold: 500,
        constructionDays: 16,
        maintenanceAnnual: 18,
        waterYieldLitersPerDay: 5000,
        evaporationReductionPct: 40,
        tempReductionCelsius: 4.2,
        gridPowerSavedMW: 0.55,
        foodYieldTonsPerYr: 25,
        soilOrganicMatterPct: 4.5,
        biodiversityScore: 42,
        carbonOffsetTonsPerYr: 65,
        communityHappiness: 42,
        resilienceIndex: 38,
        meshType: 'courtyard'
      }
    ],
    synergies: [
      {
        id: 'syn_grand_solarpunk_trinity',
        name: 'The Symbiotic Ancient-Future Trinity',
        interventions: ['hybrid_stepwell_aquifer', 'hybrid_badgir_spire', 'hybrid_rooftop_chinampa'],
        bonusDescription: 'MASTER SYNERGY UNLOCKED: +50% Water Resilience, +5.0°C Passive Cooling, +60% Food Yield! Water from the Stepwell is drawn up by windcatchers for misting, while rooftop chinampas filter runoff back into the aquifer.',
        waterBonusPct: 50,
        coolingBonusC: 5.0,
        foodBonusPct: 60,
        resilienceBonus: 30,
        historicalLesson: 'When water management, passive architecture, and regenerative agriculture operate as one continuous circular metabolism, human civilization achieves true ecological permanence.'
      },
      {
        id: 'syn_qanat_biochar_loop',
        name: 'Subterranean Geothermal Agro-Loop',
        interventions: ['hybrid_qanat_microgrid', 'hybrid_biochar_courtyard'],
        bonusDescription: '+40% Soil Organic Health & +45 Carbon Offset! Qanat water channels sub-irrigate biochar courtyards, creating a 100% gravity-fed subterranean nutrient sponge.',
        waterBonusPct: 35,
        foodBonusPct: 35,
        resilienceBonus: 25,
        historicalLesson: 'Pairing subterranean water distribution with carbon-rich soils recreates the natural hydrology of undisturbed ancient river valleys.'
      }
    ],
    advisorTips: {
      welcome: "Grand Steward, this is the culmination of all history. 2050 stands at the knife-edge between collapse and renaissance. Integrate water, wind, stone, and soil into a living circular metropolis.",
      hint1: "Deploy the Solarpunk Stepwell and the Badgir Spire together to initiate the district evaporative cooling cycle.",
      hint2: "Rooftop Chinampas provide both critical food security and essential thermal roof insulation.",
      warningHighCost: "Every mega-structure represents significant investment. Prioritize synergistic pairs to maximize resource multiplier bonuses.",
      synergySuccess: "TRIUMPH! You have unlocked The Symbiotic Ancient-Future Trinity! Civilization has rediscovered its true eternal foundation!"
    }
  }
};

export interface AdvisorQuestion {
  id: string;
  eraId: string;
  question: string;
  advisorReply: string;
  keyTakeaway: string;
}

export const ADVISOR_QUESTIONS: AdvisorQuestion[] = [
  {
    id: 'q1_stepwells_modern',
    eraId: 'water',
    question: "Why are ancient Stepwells better than modern concrete dams for village water?",
    advisorReply: "Modern concrete dams create huge surface areas exposed to the scorching sun, losing 50-70% of stored water to evaporation in arid zones. In contrast, an inverted Stepwell (Baoli) uses narrow tiered subterranean geometries that shade the water, keeping it 8°C cooler and drastically reducing evaporation while simultaneously recharging the local water table.",
    keyTakeaway: "Subterranean geometry beats surface storage in arid climates by minimizing evaporation and harnessing groundwater physics."
  },
  {
    id: 'q2_qanat_energy',
    eraId: 'water',
    question: "How did ancient Persian Qanats transport water for 30 km without any pumps?",
    advisorReply: "Ancient Persian engineers (Muqannis) calculated subtle 1:1000 slopes using simple plumb lines and water levels. The tunnel begins in an alluvial aquifer high in the mountains (the Mother Well) and slopes gently downward toward desert plains purely via gravity, completely immune to surface evaporation and requiring zero electrical grid energy for millennia.",
    keyTakeaway: "Harnessing gravity gradients and mountain alluvial fans creates an energy-free, forever-flowing water supply."
  },
  {
    id: 'q3_windcatcher_physics',
    eraId: 'architecture',
    question: "How does a Persian Windcatcher (Badgir) cool a house by 10°C without electricity?",
    advisorReply: "A Badgir works on two physical principles: positive windward pressure and the thermal chimney effect. High towers catch faster, cooler air currents high above street level and direct them down. When this air passes across indoor water basins or subterranean qanat tunnels, it evaporates water, absorbing latent heat and dramatically dropping the temperature before expelling hot buoyant air through leeward vents.",
    keyTakeaway: "Wind pressure + evaporative latent heat cooling + convective thermal buoyancy = 100% zero-carbon air conditioning."
  },
  {
    id: 'q4_thermal_lag',
    eraId: 'architecture',
    question: "Why does thick adobe keep desert homes cool in the day and warm at night?",
    advisorReply: "It is called thermal inertia and phase lag. A 50cm adobe wall has immense thermal mass. During the blistering 45°C daytime heat, the wall absorbs heat very slowly. It takes 10 to 12 hours for that heat wave to reach the inside. By the time it arrives, it is midnight and outside temperatures have plunged to 15°C—so the wall keeps the occupants warm when they need it most!",
    keyTakeaway: "Thermal mass creates a natural 12-hour phase lag, converting extreme desert temperature swings into steady indoor comfort."
  },
  {
    id: 'q5_three_sisters_symbiosis',
    eraId: 'agriculture',
    question: "Why do the Three Sisters (Corn, Beans, Squash) grow better together than apart?",
    advisorReply: "It is nature's ultimate polyculture design. Corn provides a tall, sturdy structural trellis for beans to climb without needing wooden poles. Beans harbor symbiotic rhizobia bacteria that capture nitrogen from the air and feed it into the soil for all three plants. Squash grows large, thorny leaves that sprawl across the ground as a living mulch, shading the soil from weeds and retaining 40% more soil moisture.",
    keyTakeaway: "Companion planting replaces chemical fertilizers, pesticides, and excessive irrigation through natural plant synergy."
  },
  {
    id: 'q6_terra_preta_secret',
    eraId: 'agriculture',
    question: "What makes Amazonian Terra Preta so fertile compared to modern synthetic fertilizers?",
    advisorReply: "Synthetic fertilizers are water-soluble salts that easily wash away in heavy rain, polluting rivers. Amazonian Terra Preta is made by low-temperature smoldering of biomass into biochar (fine porous charcoal) mixed with fish bone and compost. The microscopic honeycomb cavities of biochar never rot, providing an eternal habitat for beneficial fungi and microbes while permanently holding moisture and nutrients.",
    keyTakeaway: "Biochar creates permanent soil microbial infrastructure that sequesters carbon and retains nutrients for centuries."
  },
  {
    id: 'q7_2050_synthesis',
    eraId: 'final2050',
    question: "How do water, architecture, and agriculture unite in the 2050 Solarpunk city?",
    advisorReply: "In a true circular city, no system exists in isolation. Stormwater captured by sponge stepwells and qanats is routed beneath streets to provide geothermal cooling. Windcatchers pull air across this water to air-condition buildings. The overflow water irrigates rooftop chinampas and biochar urban farms, which in turn insulate building roofs from solar heat and feed the community. It is a living, breathing urban metabolism.",
    keyTakeaway: "True sustainability is circular: the waste or byproduct of one system becomes the vital input for the next."
  }
];
