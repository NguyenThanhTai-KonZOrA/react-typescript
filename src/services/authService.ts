export interface LoginResponse {
  token: string;
  user: { id: number; userName: string };
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch("https://localhost:44334/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}
