import { Message } from '@/types/game';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';

const model = getChatOpenAI();

const template = `
You are an expert business analyst. Given the current business situation and a list of actions taken by the C-suite executives, analyze the potential impact of these actions on the company's performance.

Current Situation:
{situation}

C-Suite Actions:
{actions}

Provide a concise analysis of the likely impacts of these actions on the company's key performance indicators (KPIs):
1. Revenue
2. Profit Margin
3. CAC/CLV Ratio
4. Production Efficiency Index
5. Market Share
6. Innovation Index

Your analysis should be structured and to the point, focusing on the most significant impacts. Use a scale of -5 to +5 for each KPI, where -5 is extremely negative, 0 is neutral, and +5 is extremely positive.

Output your analysis in the following JSON format:
{{
  "revenue": {{
    "impact": <number>,
    "reason": "<brief explanation>"
  }},
  "profitMargin": {{
    "impact": <number>,
    "reason": "<brief explanation>"
  }},
  "cacClvRatio": {{
    "impact": <number>,
    "reason": "<brief explanation>"
  }},
  "productionEfficiencyIndex": {{
    "impact": <number>,
    "reason": "<brief explanation>"
  }},
  "marketShare": {{
    "impact": <number>,
    "reason": "<brief explanation>"
  }},
  "innovationIndex": {{
    "impact": <number>,
    "reason": "<brief explanation>"
  }}
}}
`;

const prompt = PromptTemplate.fromTemplate(template);

export async function analyzeImpact(situation: string, cSuiteActions: string[]): Promise<string> {
  const actions = cSuiteActions.join("\n");
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  
  const result = await chain.invoke({
    situation,
    actions,
  });

  return result;
}
