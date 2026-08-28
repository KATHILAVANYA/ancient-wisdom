// Ancient Wisdom vs Modern Problems — Pure Functional Simulation Core
import { ERAS, AncientIntervention, SynergyCombo, EraConfig } from './ancientData';

export interface PlacedIntervention {
  instanceId: string;
  interventionId: string;
  tileX: number;
  tileZ: number;
  placedAtDays: number;
}

export interface EraSimulationResult {
  waterDaysAvailable: number;
  dailyWaterBalanceLiters: number;
  indoorTempCelsius: number;
  temperatureReductionC: number;
  gridPowerSavedMW: number;
  gridStressPct: number;
  foodYieldTonsPerYr: number;
  soilOrganicMatterPct: number;
  biodiversityScore: number;
  carbonOffsetTonsPerYr: number;
  communityHappinessPct: number;
  resilienceRating: number;
  totalCostSpentGold: number;
  remainingBudgetGold: number;
  activeSynergies: SynergyCombo[];
  radarScores: {
    waterSecurity: number;      // 0-100
    thermalComfort: number;     // 0-100
    foodSoilHealth: number;     // 0-100
    carbonOffset: number;       // 0-100
    communityWellbeing: number; // 0-100
    costEfficiency: number;     // 0-100
    climateResilience: number;  // 0-100
  };
  overallSustainabilityScore: number; // 0-100
  passedSuccessCriteria: boolean;
  eraCompleted: boolean;
}

export interface GameState {
  currentEraId: 'water' | 'architecture' | 'agriculture' | 'final2050';
  unlockedEras: ('water' | 'architecture' | 'agriculture' | 'final2050')[];
  completedEras: ('water' | 'architecture' | 'agriculture' | 'final2050')[];
  activeTab: 'story' | 'codex' | 'builder' | 'simulation' | 'advisor' | 'results';
  placedByEra: Record<string, PlacedIntervention[]>;
  budgetByEra: Record<string, number>;
  simulationDay: number;
  isSimulating: boolean;
  simSpeed: number;
  advisorSelectedQuestionId: string | null;
  advisorDialogueHistory: { speaker: 'player' | 'advisor'; text: string; timestamp: number }[];
  notifications: { id: string; type: 'info' | 'success' | 'warning' | 'synergy'; text: string }[];
  selectedInterventionId: string | null;
  hoveredTile: { x: number; z: number } | null;
  inspectedInterventionId: string | null;
  audioMuted: boolean;
  grandVictory: boolean;
}

export function createInitialGameState(): GameState {
  const initialBudget: Record<string, number> = {};
  const initialPlaced: Record<string, PlacedIntervention[]> = {};

  Object.values(ERAS).forEach((era) => {
    initialBudget[era.id] = era.modernCrisis.budget;
    initialPlaced[era.id] = [];
  });

  // Seed initial starter structure for immediate 3D visualization
  initialPlaced.water = [
    {
      instanceId: 'starter_stepwell_0',
      interventionId: 'stepwell_baoli',
      tileX: 0,
      tileZ: 0,
      placedAtDays: 0,
    },
  ];

  return {
    currentEraId: 'water',
    unlockedEras: ['water'],
    completedEras: [],
    activeTab: 'builder',
    placedByEra: initialPlaced,
    budgetByEra: initialBudget,
    simulationDay: 0,
    isSimulating: false,
    simSpeed: 1,
    advisorSelectedQuestionId: null,
    advisorDialogueHistory: [
      {
        speaker: 'advisor',
        text: ERAS.water.advisorTips.welcome,
        timestamp: Date.now(),
      },
    ],
    notifications: [
      {
        id: 'init_welcome',
        type: 'info',
        text: 'Welcome! Explore ancient engineering blueprints or consult the Ancient Advisor.',
      },
    ],
    selectedInterventionId: ERAS.water.interventions[1].id, // Johad selected next for synergy
    hoveredTile: null,
    inspectedInterventionId: null,
    audioMuted: false,
    grandVictory: false,
  };
}

// Compute active synergies for a given set of placed interventions
export function computeActiveSynergies(
  placed: PlacedIntervention[],
  eraConfig: EraConfig
): SynergyCombo[] {
  const placedIds = new Set(placed.map((p) => p.interventionId));
  return eraConfig.synergies.filter((syn) =>
    syn.interventions.every((reqId) => placedIds.has(reqId))
  );
}

// Deterministic calculation of simulation outcomes for the current era
export function calculateEraSimulation(
  eraId: string,
  placed: PlacedIntervention[],
  budgetLimit: number
): EraSimulationResult {
  const eraConfig = ERAS[eraId] || ERAS.water;
  const baseline = eraConfig.modernCrisis.baselineMetrics;
  const activeSynergies = computeActiveSynergies(placed, eraConfig);

  let totalCost = 0;
  let totalWaterYield = 0;
  let totalTempReduction = 0;
  let totalGridSavedMW = 0;
  let totalFoodYield = 0;
  let totalSoilOrganic = 0;
  let totalBiodiversity = 0;
  let totalCarbonOffset = 0;
  let totalCommunityHappiness = 0;
  let totalResilienceDelta = 0;

  placed.forEach((p) => {
    const item = eraConfig.interventions.find((i) => i.id === p.interventionId);
    if (!item) return;
    totalCost += item.costGold;
    totalWaterYield += item.waterYieldLitersPerDay;
    totalTempReduction += item.tempReductionCelsius;
    totalGridSavedMW += item.gridPowerSavedMW;
    totalFoodYield += item.foodYieldTonsPerYr;
    totalSoilOrganic += item.soilOrganicMatterPct;
    totalBiodiversity += item.biodiversityScore;
    totalCarbonOffset += item.carbonOffsetTonsPerYr;
    totalCommunityHappiness += item.communityHappiness;
    totalResilienceDelta += item.resilienceIndex;
  });

  // Apply active synergy bonuses
  activeSynergies.forEach((syn) => {
    if (syn.waterBonusPct) totalWaterYield *= 1 + syn.waterBonusPct / 100;
    if (syn.coolingBonusC) totalTempReduction += syn.coolingBonusC;
    if (syn.foodBonusPct) totalFoodYield *= 1 + syn.foodBonusPct / 100;
    if (syn.resilienceBonus) totalResilienceDelta += syn.resilienceBonus;
  });

  // Diminishing returns & physics clamps
  const tempReductionClamped = Math.min(14, totalTempReduction);
  const indoorTemp = Math.max(22, baseline.ambientTempC - tempReductionClamped);

  const waterMultiplier = totalWaterYield / 35000;
  const waterDaysAvailable = Math.round(baseline.waterAvailableDays + waterMultiplier * 120);

  const gridStressPct = Math.max(10, baseline.gridStressPct - totalGridSavedMW * 60);
  const soilOrganicMatterPct = Math.min(6.8, +(0.4 + totalSoilOrganic).toFixed(1));
  const soilDegradationPct = Math.max(5, baseline.soilDegradationPct - totalSoilOrganic * 16);
  const communityHappinessPct = Math.min(100, Math.round(baseline.communitySatisfactionPct + totalCommunityHappiness * 0.7));
  const resilienceRating = Math.min(100, Math.round(baseline.resilienceRating + totalResilienceDelta * 0.8));

  // Compute 7 Radar Axes (0 to 100 scale)
  const waterSecurity = Math.min(100, Math.round((waterDaysAvailable / 365) * 100));
  const thermalComfort = Math.min(100, Math.round(((48 - indoorTemp) / 24) * 100));
  const foodSoilHealth = Math.min(100, Math.round((soilOrganicMatterPct / 5.5) * 60 + (totalFoodYield / 100) * 40));
  const carbonOffset = Math.min(100, Math.round((totalCarbonOffset / 120) * 100));
  const communityWellbeing = communityHappinessPct;
  const costEfficiency = totalCost <= budgetLimit
    ? Math.min(100, Math.round(((budgetLimit - totalCost) / budgetLimit) * 40 + 60))
    : Math.max(0, Math.round(50 - ((totalCost - budgetLimit) / budgetLimit) * 100));
  const climateResilience = resilienceRating;

  // Weighted overall score
  let weightedScore = 0;
  if (eraId === 'water') {
    weightedScore = waterSecurity * 0.35 + climateResilience * 0.2 + communityWellbeing * 0.15 + costEfficiency * 0.15 + carbonOffset * 0.15;
  } else if (eraId === 'architecture') {
    weightedScore = thermalComfort * 0.35 + carbonOffset * 0.2 + climateResilience * 0.2 + costEfficiency * 0.15 + communityWellbeing * 0.1;
  } else if (eraId === 'agriculture') {
    weightedScore = foodSoilHealth * 0.35 + carbonOffset * 0.2 + waterSecurity * 0.15 + climateResilience * 0.15 + communityWellbeing * 0.15;
  } else {
    // 2050 grand finale requires balance across all 7 axes
    weightedScore = (waterSecurity + thermalComfort + foodSoilHealth + carbonOffset + communityWellbeing + costEfficiency + climateResilience) / 7;
  }

  // Bonus for synergies
  const synergyBonus = activeSynergies.length * 4;
  const overallSustainabilityScore = Math.min(100, Math.round(weightedScore + synergyBonus));

  const passedSuccessCriteria =
    overallSustainabilityScore >= eraConfig.modernCrisis.successGoals.minSustainabilityScore &&
    totalCost <= budgetLimit;

  return {
    waterDaysAvailable,
    dailyWaterBalanceLiters: Math.round(totalWaterYield),
    indoorTempCelsius: +indoorTemp.toFixed(1),
    temperatureReductionC: +tempReductionClamped.toFixed(1),
    gridPowerSavedMW: +totalGridSavedMW.toFixed(2),
    gridStressPct: Math.round(gridStressPct),
    foodYieldTonsPerYr: Math.round(totalFoodYield),
    soilOrganicMatterPct,
    biodiversityScore: Math.round(totalBiodiversity),
    carbonOffsetTonsPerYr: Math.round(totalCarbonOffset),
    communityHappinessPct,
    resilienceRating,
    totalCostSpentGold: totalCost,
    remainingBudgetGold: budgetLimit - totalCost,
    activeSynergies,
    radarScores: {
      waterSecurity,
      thermalComfort,
      foodSoilHealth,
      carbonOffset,
      communityWellbeing,
      costEfficiency,
      climateResilience,
    },
    overallSustainabilityScore,
    passedSuccessCriteria,
    eraCompleted: passedSuccessCriteria,
  };
}

// Action Reducer for Game State Commands
export type GameAction =
  | { type: 'SELECT_ERA'; eraId: 'water' | 'architecture' | 'agriculture' | 'final2050' }
  | { type: 'SET_ACTIVE_TAB'; tab: 'story' | 'codex' | 'builder' | 'simulation' | 'advisor' | 'results' }
  | { type: 'SELECT_INTERVENTION'; interventionId: string }
  | { type: 'PLACE_INTERVENTION'; tileX: number; tileZ: number }
  | { type: 'REMOVE_INTERVENTION'; instanceId: string }
  | { type: 'CLEAR_ERA_INTERVENTIONS'; eraId: string }
  | { type: 'START_SIMULATION' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'SET_SIM_SPEED'; speed: number }
  | { type: 'TICK_SIMULATION'; dt: number }
  | { type: 'ASK_ADVISOR'; questionId: string }
  | { type: 'COMPLETE_ERA'; eraId: 'water' | 'architecture' | 'agriculture' | 'final2050' }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'RESET_RUN' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_ERA': {
      if (!state.unlockedEras.includes(action.eraId)) return state;
      const era = ERAS[action.eraId];
      const selectedItem = era.interventions[0]?.id || null;
      return {
        ...state,
        currentEraId: action.eraId,
        activeTab: 'story',
        selectedInterventionId: selectedItem,
        advisorDialogueHistory: [
          ...state.advisorDialogueHistory,
          {
            speaker: 'advisor',
            text: era.advisorTips.welcome,
            timestamp: Date.now(),
          },
        ],
      };
    }

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };

    case 'SELECT_INTERVENTION':
      return { ...state, selectedInterventionId: action.interventionId };

    case 'PLACE_INTERVENTION': {
      const era = ERAS[state.currentEraId];
      const selectedItem = era.interventions.find((i) => i.id === state.selectedInterventionId);
      if (!selectedItem) return state;

      const currentPlaced = state.placedByEra[state.currentEraId] || [];
      // Prevent duplicate placement on same tile
      const existingAtTile = currentPlaced.find((p) => p.tileX === action.tileX && p.tileZ === action.tileZ);
      if (existingAtTile) {
        // Replace existing
        const filtered = currentPlaced.filter((p) => p.instanceId !== existingAtTile.instanceId);
        const newPlacedItem: PlacedIntervention = {
          instanceId: `${selectedItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          interventionId: selectedItem.id,
          tileX: action.tileX,
          tileZ: action.tileZ,
          placedAtDays: state.simulationDay,
        };
        const updatedList = [...filtered, newPlacedItem];
        const newPlacedByEra = { ...state.placedByEra, [state.currentEraId]: updatedList };

        // Check for new synergies
        const activeSyns = computeActiveSynergies(updatedList, era);
        const notifications = [...state.notifications];
        if (activeSyns.length > 0) {
          const latestSyn = activeSyns[activeSyns.length - 1];
          notifications.push({
            id: `syn_${Date.now()}`,
            type: 'synergy',
            text: `Synergy Discovered: ${latestSyn.name}! ${latestSyn.bonusDescription}`,
          });
        }

        return {
          ...state,
          placedByEra: newPlacedByEra,
          notifications,
        };
      }

      // Add new
      const newPlacedItem: PlacedIntervention = {
        instanceId: `${selectedItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        interventionId: selectedItem.id,
        tileX: action.tileX,
        tileZ: action.tileZ,
        placedAtDays: state.simulationDay,
      };
      const updatedList = [...currentPlaced, newPlacedItem];
      const newPlacedByEra = { ...state.placedByEra, [state.currentEraId]: updatedList };

      const activeSyns = computeActiveSynergies(updatedList, era);
      const notifications = [...state.notifications];
      if (activeSyns.length > 0) {
        const latestSyn = activeSyns[activeSyns.length - 1];
        if (!state.notifications.some((n) => n.text.includes(latestSyn.name))) {
          notifications.push({
            id: `syn_${Date.now()}`,
            type: 'synergy',
            text: `Synergy Discovered: ${latestSyn.name}! ${latestSyn.bonusDescription}`,
          });
        }
      }

      return {
        ...state,
        placedByEra: newPlacedByEra,
        notifications,
      };
    }

    case 'REMOVE_INTERVENTION': {
      const currentPlaced = state.placedByEra[state.currentEraId] || [];
      const updated = currentPlaced.filter((p) => p.instanceId !== action.instanceId);
      return {
        ...state,
        placedByEra: { ...state.placedByEra, [state.currentEraId]: updated },
      };
    }

    case 'CLEAR_ERA_INTERVENTIONS': {
      return {
        ...state,
        placedByEra: { ...state.placedByEra, [action.eraId]: [] },
      };
    }

    case 'START_SIMULATION':
      return { ...state, isSimulating: true, activeTab: 'simulation' };

    case 'PAUSE_SIMULATION':
      return { ...state, isSimulating: false };

    case 'SET_SIM_SPEED':
      return { ...state, simSpeed: action.speed };

    case 'TICK_SIMULATION': {
      if (!state.isSimulating) return state;
      const nextDay = state.simulationDay + action.dt * state.simSpeed * 10;
      const eraConfig = ERAS[state.currentEraId];
      const targetDays = eraConfig.modernCrisis.targetSurvivalDays;

      if (nextDay >= targetDays) {
        // Simulation cycle complete -> show results
        const placed = state.placedByEra[state.currentEraId] || [];
        const outcome = calculateEraSimulation(state.currentEraId, placed, eraConfig.modernCrisis.budget);

        const updatedCompleted = outcome.passedSuccessCriteria && !state.completedEras.includes(state.currentEraId)
          ? [...state.completedEras, state.currentEraId]
          : state.completedEras;

        // Determine next unlocked era
        let updatedUnlocked = [...state.unlockedEras];
        if (outcome.passedSuccessCriteria) {
          if (state.currentEraId === 'water' && !updatedUnlocked.includes('architecture')) {
            updatedUnlocked.push('architecture');
          } else if (state.currentEraId === 'architecture' && !updatedUnlocked.includes('agriculture')) {
            updatedUnlocked.push('agriculture');
          } else if (state.currentEraId === 'agriculture' && !updatedUnlocked.includes('final2050')) {
            updatedUnlocked.push('final2050');
          }
        }

        const isGrandVic = state.currentEraId === 'final2050' && outcome.passedSuccessCriteria;

        return {
          ...state,
          simulationDay: targetDays,
          isSimulating: false,
          activeTab: 'results',
          completedEras: updatedCompleted,
          unlockedEras: updatedUnlocked,
          grandVictory: isGrandVic,
          notifications: [
            ...state.notifications,
            {
              id: `res_${Date.now()}`,
              type: outcome.passedSuccessCriteria ? 'success' : 'warning',
              text: outcome.passedSuccessCriteria
                ? `Crisis Resolved! Sustainability Score: ${outcome.overallSustainabilityScore}%. Era Mastered!`
                : `Simulation Incomplete. Score ${outcome.overallSustainabilityScore}% fell short of the target. Consult the Ancient Advisor!`,
            },
          ],
        };
      }

      return {
        ...state,
        simulationDay: nextDay,
      };
    }

    case 'ASK_ADVISOR': {
      const era = ERAS[state.currentEraId];
      return {
        ...state,
        advisorSelectedQuestionId: action.questionId,
      };
    }

    case 'COMPLETE_ERA': {
      const nextEras: Record<string, 'architecture' | 'agriculture' | 'final2050' | null> = {
        water: 'architecture',
        architecture: 'agriculture',
        agriculture: 'final2050',
        final2050: null,
      };
      const next = nextEras[action.eraId];
      if (next && state.unlockedEras.includes(next)) {
        return {
          ...state,
          currentEraId: next,
          activeTab: 'story',
          simulationDay: 0,
          isSimulating: false,
          selectedInterventionId: ERAS[next].interventions[0]?.id || null,
        };
      }
      return state;
    }

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };

    case 'TOGGLE_AUDIO':
      return { ...state, audioMuted: !state.audioMuted };

    case 'RESET_RUN':
      return createInitialGameState();

    default:
      return state;
  }
}
