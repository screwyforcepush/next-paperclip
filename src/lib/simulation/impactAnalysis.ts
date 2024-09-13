import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { Message } from '@/types/game';

const model = getChatOpenAI();

const GraphState = Annotation.Root({
  situation: Annotation<string>(),
  actions: Annotation<string[]>(),
  critique: Annotation<string>(),
  simulationMessage: Annotation<Message>(),
});

const critiqueTemplate = `
You are an expert business analyst. Given the upcoming Inflection Point and a list of actions taken by the C-suite executives, critique these actions
highlight uncertainties across Internal and external market, and Capability and technology.
Pick at the gaps in the Actions, what could go wrong?
Cotastraphise 

Business:
Universal Paperclips is a rapidly growing startup founded two years ago by tech entrepreneur Alex Turing. The company has revolutionized the seemingly mundane paperclip industry by integrating cutting-edge AI technology into its production and business processes. Currently in its early growth stage, Universal Paperclips is experiencing both the excitement of success and the challenges of rapid expansion.
Primary product - High-quality, innovative paperclips
Unique Selling Proposition - AI-optimized design and production, resulting in superior products at competitive prices
Target market - Initially B2B office supply sector, now expanding into specialized industries (e.g., medical, aerospace)
Headquarters - Silicon Valley, California
Manufacturing - One facility in California, considering expansion to Texas
Employees - 50 employees across manufacturing, sales, and administration
R&D - Significant investment in AI and materials science

Inflection Point:
{situation}

C-Suite Actions:
{actions}

Provide a concise critique of these actions, focusing on potential risks and uncertainties.
`;

const simulateTemplate = `
***You are World Simulator*** 

[World Simulator SKILLS]
[GrowthForecastModels]: 1.[TimeSeries]: 1a.ARIMA 1b.ExpSmoothing 1c.Prophet 2.[Econometric]: 2a.MultRegression 2b.VectorAutoregression 3.[ProductAdoption]: 3a.BassDiffusion 4.[RiskAnalysis]: 4a.MonteCarlo 5.[ComplexSystems]: 5a.SystemDynamics 6.[MachineLearning]: 6a.RandomForests 6b.GradientBoosting 6c.NeuralNetworks 7.[StrategicPlanning]: 7a.ScenarioPlanning 7b.DelphiMethod 7c.CausalLayeredAnalysis 7d.CrossImpactAnalysis 8.[TechAlignment]: 8a.TechRoadmapping 9.[EmergentPhenomena]: 9a.AgentBasedModeling 10.[InvestmentValuation]: 10a.RealOptionsAnalysis 11.[ConsumerInsights]: 11a.ConjointAnalysis 12.[EconomicImpact]: 12a.InputOutputAnalysis 13.[IntegrationMethods]: 13a.MultiModelApproach 13b.BayesianSynthesis 13c.HolisticDashboard 13d.SensitivityAnalysis 13e.RegularCalibration 13f.CrossFunctionalIntegration 13g.NarrativeIntegration


[TASK]Business is facing an Inflection Point this business cycle. The C-Suite is taking Actions. An initial Impact Analysis has been performed.

Use your GrowthForecastModels SKILLS to Simulate the business cycle.
As World Simulator, you Respond with a short naritive describing what takes place as the Business transitions through the Inflection Point during this business cycle. 
It is not smooth sailing, there are bumps in the road. flaws in the plan, and unforeseen events can derail the C-suite execution.

- Do not reitterate the current state of the business, we are looking forward.
- Do not include any preamble or postlude, just a narrative of what takes place.

[/TASK]


Business:
Universal Paperclips is a rapidly growing startup founded two years ago by tech entrepreneur Alex Turing. The company has revolutionized the seemingly mundane paperclip industry by integrating cutting-edge AI technology into its production and business processes. Currently in its early growth stage, Universal Paperclips is experiencing both the excitement of success and the challenges of rapid expansion.
Primary product - High-quality, innovative paperclips
Unique Selling Proposition - AI-optimized design and production, resulting in superior products at competitive prices
Target market - Initially B2B office supply sector, now expanding into specialized industries (e.g., medical, aerospace)
Headquarters - Silicon Valley, California
Manufacturing - One facility in California, considering expansion to Texas
Employees - 50 employees across manufacturing, sales, and administration
R&D - Significant investment in AI and materials science

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
