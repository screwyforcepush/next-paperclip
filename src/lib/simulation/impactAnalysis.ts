import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { Message } from '@/types/game';

const critiqueTemplate = `
You are a sharp-eyed business analyst known for your ability to identify critical flaws and potential risks in business strategies. Given the upcoming Inflection Point and the C-suite's proposed actions, provide a candid and probing assessment:

{currentOverview}

Inflection Point:
{situation}

C-Suite Actions:
{actions}

Critique Guidelines:
1. Strategic Vulnerabilities: Identify weak points in the strategy that could be exploited by competitors or market shifts.
2. Risk Analysis: Highlight how proposed actions might exacerbate existing risks or create new ones, while briefly noting any well-managed risks.
3. Execution Challenges: Pinpoint potential obstacles in implementing these actions, both internal and external.
4. Market Dynamics: Challenge assumptions about market conditions or customer behavior, particularly those that seem overly optimistic.
5. Resource Implications: Evaluate whether the proposed actions might strain the company's capabilities or resources.
6. Competitive Landscape: Anticipate possible aggressive responses from competitors that could undermine the strategy.
7. Emerging Threats: Identify market trends or disruptive forces that the C-suite may have underestimated.
8. Unintended Consequences: Explore potential negative outcomes that might arise from the proposed decisions.

Provide a pointed critique that primarily focuses on the strategy's vulnerabilities and challenges. While you may briefly acknowledge clear strengths, your main objective is to expose risks and weaknesses that need to be addressed. Your insights should serve as a crucial reality check for the C-suite, pushing them to critically examine and strengthen their approach. The tone should be direct and analytical, not harsh or antagonistic.
`;

const simulateTemplate = `
***You are World Simulator*** 

[World Simulator SKILLS]
[GrowthForecastModels]: 1.[TimeSeries]: 1a.ARIMA 1b.ExpSmoothing 1c.Prophet 2.[Econometric]: 2a.MultRegression 2b.VectorAutoregression 3.[ProductAdoption]: 3a.BassDiffusion 4.[RiskAnalysis]: 4a.MonteCarlo 5.[ComplexSystems]: 5a.SystemDynamics 6.[MachineLearning]: 6a.RandomForests 6b.GradientBoosting 6c.NeuralNetworks 7.[StrategicPlanning]: 7a.ScenarioPlanning 7b.DelphiMethod 7c.CausalLayeredAnalysis 7d.CrossImpactAnalysis 8.[TechAlignment]: 8a.TechRoadmapping 9.[EmergentPhenomena]: 9a.AgentBasedModeling 10.[InvestmentValuation]: 10a.RealOptionsAnalysis 11.[ConsumerInsights]: 11a.ConjointAnalysis 12.[EconomicImpact]: 12a.InputOutputAnalysis 13.[IntegrationMethods]: 13a.MultiModelApproach 13b.BayesianSynthesis 13c.HolisticDashboard 13d.SensitivityAnalysis 13e.RegularCalibration 13f.CrossFunctionalIntegration 13g.NarrativeIntegration


[TASK]Simulate the business cycle as Universal Paperclips navigates its Inflection Point. The C-Suite has taken specific Actions, and an Potential Risks have been identified.

Use your GrowthForecastModels SKILLS to craft a compelling narrative of the ensuing business cycle. Your simulation should:

1. Depict a realistic progression of events.
2. Incorporate probable market shifts, competitive responses, and internal challenges.
3. Show how the company's actions interact with broader industry trends and economic factors.
4. Demonstrate the ripple effects of decisions across different aspects of the business.
5. Highlight moments of innovation and setbacks, without sugar-coating the outcomes.
6. Conclude briefly with the company's position at the end of this business cycle, laying bare the results of their strategies.

Remember:
- Focus on forward-looking events and their implications.
- Avoid rehashing the current state or the actions taken.
- Maintain a realistic balance.
- Weave in subtle references to business performance without explicitly mentioning KPIs.

Craft your narrative in a concise, no-nonsense manner, bringing the simulated business cycle to life.

[/TASK]


{currentOverview}

Inflection Point:
{situation}

C-Suite Actions:
{actions}

Potential Risks:
{critique}
`;

export async function analyzeImpact(
  situation: string,
  cSuiteActions: string[],
  llmMetadata: any,
  currentOverview: string // Add this parameter
): Promise<Message> {
  const GraphState = Annotation.Root({
    situation: Annotation<string>(),
    actions: Annotation<string[]>(),
    critique: Annotation<string>(),
    simulationMessage: Annotation<Message>(),
    llmMetadata: Annotation<any>(),
    currentOverview: Annotation<string>()
  });

  const critiquePrompt = PromptTemplate.fromTemplate(critiqueTemplate);
  const simulatePrompt = PromptTemplate.fromTemplate(simulateTemplate);

  async function performCritiqueNode(state: typeof GraphState.State) {
    // Initialize model with llmMetadata and inferenceObjective
    const model = getChatOpenAI({
      ...state.llmMetadata,
      inferenceObjective: "Critique User Advice",
    });

    const critiqueChain = critiquePrompt.pipe(model).pipe(new StringOutputParser());

    const critique = await critiqueChain.invoke({
      situation: state.situation,
      actions: state.actions.join("\n"),
      currentOverview: state.currentOverview
    });
    return { critique };
  }

  async function simulateNode(state: typeof GraphState.State) {
    // Initialize model with llmMetadata and inferenceObjective
    const model = getChatOpenAI({
      ...state.llmMetadata,
      inferenceObjective: "Simulate Impact",
    });

    const simulateChain = simulatePrompt.pipe(model).pipe(new StringOutputParser());

    const simulationContent = await simulateChain.invoke({
      situation: state.situation,
      actions: state.actions.join("\n"),
      critique: state.critique,
      currentOverview: state.currentOverview // Add this line
    });
    const simulationMessage: Message = {
      role: 'simulation',
      content: simulationContent,
    };
    return { simulationMessage };
  }

  const workflow = new StateGraph(GraphState)
    .addNode("performCritique", performCritiqueNode)
    .addNode("simulate", simulateNode)
    .addEdge(START, "performCritique")  // Add this line
    .addEdge("performCritique", "simulate")
    .addEdge("simulate", END);

  const graph = workflow.compile();

  const result = await graph.invoke({
    situation,
    actions: cSuiteActions,
    llmMetadata,
    currentOverview // Add this line
  });
  return result.simulationMessage;
}