/**
 * API module for making HTTP requests
 */

const BASE_URL = "/api";

/**
 * Fetch data from the API
 * @param endpoint API endpoint
 * @returns Promise with the response data
 */
export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Post data to the API
 * @param endpoint API endpoint
 * @param data Data to post
 * @returns Promise with the response data
 */
export async function postData<T, R>(endpoint: string, data: T): Promise<R> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
