interface CommerceToolsErrorResponse {
  originalRequest: OriginalRequest;
}

interface OriginalRequest {
  body: unknown;
}

export enum ErrorType {
  COMMERCETOOLS,
  COMMERCETOOLSGRAPHQL,
  CONTENTSTACK,
}

export const formatError = (error: unknown, errorType: ErrorType): unknown => {
  if (errorType === ErrorType.COMMERCETOOLS) {
    const commercetoolsError = error as CommerceToolsErrorResponse;
    delete commercetoolsError.originalRequest?.body; // remove the body from the originalRequest to avoid logging of personal data
    return commercetoolsError;
  }
  return error;
};
