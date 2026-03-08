export default function extractApiError(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (responseData?.validationErrors && typeof responseData.validationErrors === "object") {
    const firstValidationError = Object.values(responseData.validationErrors)[0];
    if (firstValidationError) {
      return firstValidationError;
    }
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (error?.message === "Network Error" || !error?.response) {
    return "Cannot reach server. Please try again in a few seconds.";
  }

  return fallbackMessage;
}
