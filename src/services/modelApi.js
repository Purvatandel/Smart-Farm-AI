export const modelEndpoints = {
  crop:
    import.meta.env.VITE_CROP_API_URL?.trim() ||
    "http://127.0.0.1:5000/api/crop-recommendation",
  disease:
    import.meta.env.VITE_DISEASE_API_URL?.trim() ||
    "http://127.0.0.1:5000/api/disease-detection",
  weather:
    import.meta.env.VITE_WEATHER_API_URL?.trim() ||
    "http://127.0.0.1:5000/api/weather",
  growth:
    import.meta.env.VITE_GROWTH_API_URL?.trim() ||
    "http://127.0.0.1:5000/api/crop-growth",
  assistant: import.meta.env.VITE_FARM_ASSISTANT_API_URL?.trim(),
};

export async function postModelRequest(endpoint, payload) {
  if (!endpoint) {
    throw new Error("MODEL_ENDPOINT_NOT_CONFIGURED");
  }

  const isFormData = payload instanceof FormData;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
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
        `Request failed (${response.status})`,
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
    return `${featureName} service is currently unavailable. Please make sure the backend server is running on port 5000.`;
  }

  return (
    error.message || `Could not get a ${featureName.toLowerCase()} result.`
  );
}
