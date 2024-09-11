import { runSimulation } from '../agents/agentManager';
import { kpiCalculator } from './kpiCalculator';

export class BusinessEngine {
  static async runBusinessCycle(situation: string, userAdvice: string) {
    console.log("[BusinessEngine.runBusinessCycle] Starting business cycle");
    console.log("[BusinessEngine.runBusinessCycle] Situation:", situation);
    console.log("[BusinessEngine.runBusinessCycle] User advice:", userAdvice);

    try {
      console.log("[BusinessEngine.runBusinessCycle] Calling runSimulation");
      const result = await runSimulation(situation, userAdvice);
      console.log("[BusinessEngine.runBusinessCycle] Simulation result:", JSON.stringify(result, null, 2));

      // Process the simulation result and update KPIs
      const updatedKPIs = kpiCalculator.calculateKPIs(result);
      
      return {
        agentResponses: result,
        updatedKPIs: updatedKPIs,
      };
    } catch (error) {
      console.error("[BusinessEngine.runBusinessCycle] Error in simulation:", error);
      throw error;
    }
  }
}
