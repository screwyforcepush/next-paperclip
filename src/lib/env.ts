export const getServerSideEnv = () => ({
  OPENAI_API_KEY: process.env.LITELLM_API_KEY,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  LITELLM_BASE_PATH: process.env.LITELLM_BASE_PATH,
});

export const getClientSideEnv = () => ({
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});