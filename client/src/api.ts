import { ContactPayload, SiteContent } from "./types";

// EDITABLE: change this if your backend URL changes in deployment.
const API_BASE = "http://localhost:5000/api";

export const getContent = async (): Promise<SiteContent> => {
  const response = await fetch(`${API_BASE}/content`);
  if (!response.ok) {
    throw new Error("Unable to load website content.");
  }
  return response.json() as Promise<SiteContent>;
};

export const updateContent = async (payload: SiteContent): Promise<SiteContent> => {
  const response = await fetch(`${API_BASE}/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Unable to save content.");
  }

  return response.json() as Promise<SiteContent>;
};

export const submitContact = async (payload: ContactPayload): Promise<string> => {
  const response = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(data.message || "Unable to submit form.");
  }

  return data.message || "Contact request sent successfully.";
};
