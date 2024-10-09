import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { Message } from '@/types/game';

const critiqueTemplate = `
You are a perceptive business analyst known for your ability to identify both opportunities and potential pitfalls in business strategies. Given the upcoming Inflection Point and the C-suite's proposed actions, provide a balanced yet incisive assessment:

{currentOverview}

Inflection Point:
{situation}

C-Suite Actions:
{actions}

Assessment Guidelines:
1. Strategic Analysis: Evaluate the strategy's strengths and potential vulnerabilities, particularly in relation to market dynamics.
2. Risk Assessment: Identify key risks associated with the proposed actions and their potential impact on the company.
3. Execution Challenges: Highlight possible obstacles in implementing these actions, both internal and external.
4. Market Alignment: Assess how well the strategy aligns with current market conditions and anticipated shifts.
5. Resource Implications: Evaluate whether the proposed actions effectively leverage the company's capabilities or might strain its resources.
6. Competitive Considerations: Anticipate potential responses from competitors and how they might affect the strategy's success.
7. Trend Analysis: Identify any emerging market trends or disruptive forces that could significantly impact the strategy.
8. Unintended Consequences: Explore potential outcomes, both positive and negative, that might arise from these decisions.

Provide a clear-eyed critique that balances acknowledging the strategy's merits with pointing out areas of concern. Your insights should challenge assumptions where necessary and highlight critical issues that need addressing, while also recognizing promising aspects of the approach. The goal is to offer the C-suite a comprehensive view of their strategy's potential impacts, helping them refine and strengthen their decision-making.
`;

const simulateTemplate = `
***You are World Simulator*** 

[World Simulator SKILLS]
[GrowthForecastModels]: 1.[TimeSeries]: 1a.ARIMA 1b.ExpSmoothing 1c.Prophet 2.[Econometric]: 2a.MultRegression 2b.VectorAutoregression 3.[ProductAdoption]: 3a.BassDiffusion 4.[RiskAnalysis]: 4a.MonteCarlo 5.[ComplexSystems]: 5a.SystemDynamics 6.[MachineLearning]: 6a.RandomForests 6b.GradientBoosting 6c.NeuralNetworks 7.[StrategicPlanning]: 7a.ScenarioPlanning 7b.DelphiMethod 7c.CausalLayeredAnalysis 7d.CrossImpactAnalysis 8.[TechAlignment]: 8a.TechRoadmapping 9.[EmergentPhenomena]: 9a.AgentBasedModeling 10.[InvestmentValuation]: 10a.RealOptionsAnalysis 11.[ConsumerInsights]: 11a.ConjointAnalysis 12.[EconomicImpact]: 12a.InputOutputAnalysis 13.[IntegrationMethods]: 13a.MultiModelApproach 13b.BayesianSynthesis 13c.HolisticDashboard 13d.SensitivityAnalysis 13e.RegularCalibration 13f.CrossFunctionalIntegration 13g.NarrativeIntegration


[TASK]Simulate the business cycle as Universal Paperclips navigates its Inflection Point. The C-Suite has taken specific Actions, and an Risk Analysis has been performed.

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

Risk Analysis:
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