export const getServerSideEnv = () => ({
  OPENAI_API_KEY: process.env.LITELLM_API_KEY || process.env.OPENAI_API_KEY,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  LLM_BASE_PATH: process.env.LITELLM_BASE_PATH || 'https://api.openai.com/v1',
});

export const getClientSideEnv = () => ({
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});