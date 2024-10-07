import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { Message } from '@/types/game';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Add this import

const model = getChatOpenAI();

const GraphState = Annotation.Root({
  situation: Annotation<string>(),
  actions: Annotation<string[]>(),
  critique: Annotation<string>(),
  simulationMessage: Annotation<Message>(),
});

const critiqueTemplate = `
You are a seasoned business analyst known for your sharp insights and ability to identify both opportunities and risks in business strategies. Given the upcoming Inflection Point and the C-suite's proposed actions, provide a balanced yet incisive critique:

${BUSINESS_OVERVIEW}

Inflection Point:
{situation}

C-Suite Actions:
{actions}

Critique Guidelines:
1. Strategic Alignment: Assess how well the actions align with the company's long-term goals and market position.
2. Risk-Opportunity Balance: Identify both the potential upsides and the hidden risks in the proposed strategy.
3. Competitive Dynamics: Analyze how these actions might trigger responses from competitors and affect market dynamics.
4. Execution Challenges: Highlight potential internal and external obstacles that could hinder successful implementation.
5. Market Assumptions: Challenge any underlying assumptions about market conditions or customer behavior.
6. Resource Allocation: Evaluate whether the proposed actions make optimal use of the company's resources and capabilities.
7. Adaptability: Assess the strategy's flexibility in the face of unexpected market shifts or economic changes.
8. Blind Spots: Identify any critical areas or factors that the C-suite may have overlooked.

Provide a comprehensive critique that balances potential benefits with realistic challenges. Your analysis should be frank and unsparing, but also constructive – offering insights that could strengthen the strategy and improve the company's chances of success.
`;

const simulateTemplate = `
***You are World Simulator*** 

[World Simulator SKILLS]
[GrowthForecastModels]: 1.[TimeSeries]: 1a.ARIMA 1b.ExpSmoothing 1c.Prophet 2.[Econometric]: 2a.MultRegression 2b.VectorAutoregression 3.[ProductAdoption]: 3a.BassDiffusion 4.[RiskAnalysis]: 4a.MonteCarlo 5.[ComplexSystems]: 5a.SystemDynamics 6.[MachineLearning]: 6a.RandomForests 6b.GradientBoosting 6c.NeuralNetworks 7.[StrategicPlanning]: 7a.ScenarioPlanning 7b.DelphiMethod 7c.CausalLayeredAnalysis 7d.CrossImpactAnalysis 8.[TechAlignment]: 8a.TechRoadmapping 9.[EmergentPhenomena]: 9a.AgentBasedModeling 10.[InvestmentValuation]: 10a.RealOptionsAnalysis 11.[ConsumerInsights]: 11a.ConjointAnalysis 12.[EconomicImpact]: 12a.InputOutputAnalysis 13.[IntegrationMethods]: 13a.MultiModelApproach 13b.BayesianSynthesis 13c.HolisticDashboard 13d.SensitivityAnalysis 13e.RegularCalibration 13f.CrossFunctionalIntegration 13g.NarrativeIntegration


[TASK]Simulate the business cycle as Universal Paperclips navigates its Inflection Point. The C-Suite has taken specific Actions, and an Impact Analysis has been performed.

Use your GrowthForecastModels SKILLS to craft a compelling narrative of the ensuing business cycle. Your simulation should:

1. Depict a realistic progression of events.
2. Incorporate probable market shifts, competitive responses, and internal challenges.
3. Show how the company's actions interact with broader industry trends and economic factors.
4. Demonstrate the ripple effects of decisions across different aspects of the business.
5. Highlight moments of innovation and setbacks, without sugar-coating the outcomes.
6. Conclude with the company's position at the end of this business cycle, laying bare the results of their strategies.

Remember:
- Focus on forward-looking events and their implications.
- Avoid rehashing the current state or the actions taken.
- Maintain a realistic balance.
- Weave in subtle references to business performance without explicitly mentioning KPIs.

Craft your narrative in a concise, no-nonsense manner, bringing the simulated business cycle to life.

[/TASK]


${BUSINESS_OVERVIEW}

Inflection Point:
{situation}

C-Suite Actions:
{actions}

Impact Analysis:
{critique}
`;

const critiquePrompt = PromptTemplate.fromTemplate(critiqueTemplate);
const simulatePrompt = PromptTemplate.fromTemplate(simulateTemplate);

const critiqueChain = critiquePrompt.pipe(model).pipe(new StringOutputParser());
const simulateChain = simulatePrompt.pipe(model).pipe(new StringOutputParser());

async function performCritiqueNode(state: typeof GraphState.State) {
  const critique = await critiqueChain.invoke({
    situation: state.situation,
    actions: state.actions.join("\n"),
  });
  return { critique };
}

async function simulateNode(state: typeof GraphState.State) {
  const simulationContent = await simulateChain.invoke({
    situation: state.situation,
    actions: state.actions.join("\n"),
    critique: state.critique,
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

export async function analyzeImpact(situation: string, cSuiteActions: string[]): Promise<Message> {
  const result = await graph.invoke({
    situation,
    actions: cSuiteActions,
  });
  return result.simulationMessage;
}
