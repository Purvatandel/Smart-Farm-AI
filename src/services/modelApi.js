
const BASE_URL = "https://smart-farm-ai-iau4.onrender.com";

export const modelEndpoints = {
  crop: `${BASE_URL}/api/crop-recommendation`,
  disease: `${BASE_URL}/api/disease-detection`,
  weather: `${BASE_URL}/api/weather`,
  growth: `${BASE_URL}/api/crop-growth`,
  assistant: import.meta.env.VITE_FARM_ASSISTANT_API_URL?.trim(),
};

export async function postModelRequest(endpoint, payload) {
  if (!endpoint) {
    throw new Error("MODEL_ENDPOINT_NOT_CONFIGURED");
  }

  const isFormData = payload instanceof FormData;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: isFormData
      ? undefined
      : { "Content-Type": "application/json" },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.error ||
        data.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

export function modelErrorMessage(error, featureName) {
  if (
    error.message === "MODEL_ENDPOINT_NOT_CONFIGURED" ||
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError")
  ) {
    return `${featureName} service is currently unavailable. Please check the backend connection.`;
  }

  return error.message ||
    `Could not get a ${featureName.toLowerCase()} result.`;
}
