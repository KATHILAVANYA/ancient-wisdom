import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  calculateEraSimulation,
  computeActiveSynergies,
  gameReducer,
  PlacedIntervention,
} from './ancientSimState';
import { ERAS, ADVISOR_QUESTIONS } from './ancientData';

describe('Ancient Wisdom vs Modern Problems - Simulation Engine', () => {
  it('initializes game state with Water era unlocked', () => {
    const state = createInitialGameState();
    expect(state.currentEraId).toBe('water');
    expect(state.unlockedEras).toContain('water');
    expect(state.unlockedEras.length).toBe(1);
    expect(state.completedEras.length).toBe(0);
    expect(state.isSimulating).toBe(false);
  });

  it('calculates water era simulation baseline correctly without interventions', () => {
    const result = calculateEraSimulation('water', [], ERAS.water.modernCrisis.budget);
    expect(result.waterDaysAvailable).toBe(30);
    expect(result.totalCostSpentGold).toBe(0);
    expect(result.passedSuccessCriteria).toBe(false);
    expect(result.activeSynergies.length).toBe(0);
  });

  it('triggers Stepwell + Johad synergy and passes Water Era criteria with balanced placement', () => {
    const placed: PlacedIntervention[] = [
      { instanceId: '1', interventionId: 'stepwell_baoli', tileX: 0, tileZ: 0, placedAtDays: 0 },
      { instanceId: '2', interventionId: 'johad_percolation', tileX: 1, tileZ: 0, placedAtDays: 0 },
      { instanceId: '3', interventionId: 'roman_cistern', tileX: 2, tileZ: 0, placedAtDays: 0 },
      { instanceId: '4', interventionId: 'ahar_pyne_canal', tileX: 3, tileZ: 0, placedAtDays: 0 },
    ];

    const synergies = computeActiveSynergies(placed, ERAS.water);
    expect(synergies.some((s) => s.id === 'syn_johad_stepwell')).toBe(true);

    const result = calculateEraSimulation('water', placed, ERAS.water.modernCrisis.budget);
    expect(result.waterDaysAvailable).toBeGreaterThanOrEqual(365);
    expect(result.totalCostSpentGold).toBeLessThanOrEqual(ERAS.water.modernCrisis.budget);
    expect(result.overallSustainabilityScore).toBeGreaterThanOrEqual(78);
    expect(result.passedSuccessCriteria).toBe(true);
  });

  it('triggers Windcatcher + Courtyard synergy in Architecture Era', () => {
    const placed: PlacedIntervention[] = [
      { instanceId: '1', interventionId: 'badgir_windcatcher', tileX: 0, tileZ: 0, placedAtDays: 0 },
      { instanceId: '2', interventionId: 'central_courtyard', tileX: 1, tileZ: 0, placedAtDays: 0 },
      { instanceId: '3', interventionId: 'thick_adobe_walls', tileX: 2, tileZ: 0, placedAtDays: 0 },
      { instanceId: '4', interventionId: 'mashrabiya_jali', tileX: 3, tileZ: 0, placedAtDays: 0 },
    ];

    const synergies = computeActiveSynergies(placed, ERAS.architecture);
    expect(synergies.some((s) => s.id === 'syn_wind_courtyard')).toBe(true);
    expect(synergies.some((s) => s.id === 'syn_adobe_mashrabiya')).toBe(true);

    const result = calculateEraSimulation('architecture', placed, ERAS.architecture.modernCrisis.budget);
    expect(result.indoorTempCelsius).toBeLessThanOrEqual(36);
    expect(result.overallSustainabilityScore).toBeGreaterThanOrEqual(82);
    expect(result.passedSuccessCriteria).toBe(true);
  });

  it('triggers Milpa + Terra Preta synergy in Agriculture Era', () => {
    const placed: PlacedIntervention[] = [
      { instanceId: '1', interventionId: 'three_sisters_milpa', tileX: 0, tileZ: 0, placedAtDays: 0 },
      { instanceId: '2', interventionId: 'amazon_terra_preta', tileX: 1, tileZ: 0, placedAtDays: 0 },
      { instanceId: '3', interventionId: 'aztec_chinampas', tileX: 2, tileZ: 0, placedAtDays: 0 },
      { instanceId: '4', interventionId: 'sahel_zai_pits', tileX: 3, tileZ: 0, placedAtDays: 0 },
    ];

    const synergies = computeActiveSynergies(placed, ERAS.agriculture);
    expect(synergies.some((s) => s.id === 'syn_milpa_terra_preta')).toBe(true);

    const result = calculateEraSimulation('agriculture', placed, ERAS.agriculture.modernCrisis.budget);
    expect(result.soilOrganicMatterPct).toBeGreaterThanOrEqual(4.5);
    expect(result.overallSustainabilityScore).toBeGreaterThanOrEqual(80);
    expect(result.passedSuccessCriteria).toBe(true);
  });

  it('completes all eras and unlocks 2050 Solarpunk Grand Challenge', () => {
    let state = createInitialGameState();

    // Place Water era solutions
    state = gameReducer(state, { type: 'SELECT_INTERVENTION', interventionId: 'stepwell_baoli' });
    state = gameReducer(state, { type: 'PLACE_INTERVENTION', tileX: 0, tileZ: 0 });
    state = gameReducer(state, { type: 'SELECT_INTERVENTION', interventionId: 'johad_percolation' });
    state = gameReducer(state, { type: 'PLACE_INTERVENTION', tileX: 1, tileZ: 0 });
    state = gameReducer(state, { type: 'SELECT_INTERVENTION', interventionId: 'roman_cistern' });
    state = gameReducer(state, { type: 'PLACE_INTERVENTION', tileX: 2, tileZ: 0 });
    state = gameReducer(state, { type: 'SELECT_INTERVENTION', interventionId: 'ahar_pyne_canal' });
    state = gameReducer(state, { type: 'PLACE_INTERVENTION', tileX: 3, tileZ: 0 });

    // Start simulation and tick to completion
    state = gameReducer(state, { type: 'START_SIMULATION' });
    state = gameReducer(state, { type: 'TICK_SIMULATION', dt: 10 }); // Finish 30 days

    expect(state.completedEras).toContain('water');
    expect(state.unlockedEras).toContain('architecture');

    // Switch to Architecture
    state = gameReducer(state, { type: 'SELECT_ERA', eraId: 'architecture' });
    expect(state.currentEraId).toBe('architecture');
  });

  it('validates that advisor questions contain historical accuracy', () => {
    expect(ADVISOR_QUESTIONS.length).toBeGreaterThanOrEqual(6);
    ADVISOR_QUESTIONS.forEach((q) => {
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.advisorReply.length).toBeGreaterThan(30);
      expect(q.keyTakeaway.length).toBeGreaterThan(10);
    });
  });
});
