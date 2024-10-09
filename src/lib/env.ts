export const getServerSideEnv = () => ({
  OPENAI_API_KEY: process.env.LITELLM_API_KEY,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const getClientSideEnv = () => ({
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});