// API Utility functions for Supabase integration

// Helper to handle API responses
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "An error occurred");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Competitions
export const api = {
  competitions: {
    list: () => fetchApi<any[]>("/api/competitions"),
    get: (id: string) => fetchApi<any>(`/api/competitions/${id}`),
    create: (data: any) => fetchApi<any>("/api/competitions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi<any>(`/api/competitions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/api/competitions/${id}`, { method: "DELETE" }),
    
    stages: {
      create: (compId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/stages`, { method: "POST", body: JSON.stringify(data) }),
      update: (compId: string, stageId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/stages/${stageId}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (compId: string, stageId: string) => fetchApi<void>(`/api/competitions/${compId}/stages/${stageId}`, { method: "DELETE" }),
    },
    
    timeline: {
      create: (compId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/timeline`, { method: "POST", body: JSON.stringify(data) }),
      update: (compId: string, eventId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/timeline/${eventId}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (compId: string, eventId: string) => fetchApi<void>(`/api/competitions/${compId}/timeline/${eventId}`, { method: "DELETE" }),
    },
    
    tasks: {
      create: (compId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/tasks`, { method: "POST", body: JSON.stringify(data) }),
      update: (compId: string, taskId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (compId: string, taskId: string) => fetchApi<void>(`/api/competitions/${compId}/tasks/${taskId}`, { method: "DELETE" }),
    },
    
    deadlines: {
      create: (compId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/deadlines`, { method: "POST", body: JSON.stringify(data) }),
      delete: (compId: string, deadlineId: string) => fetchApi<void>(`/api/competitions/${compId}/deadlines/${deadlineId}`, { method: "DELETE" }),
    },
    
    members: {
      create: (compId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/members`, { method: "POST", body: JSON.stringify(data) }),
      delete: (compId: string, memberId: string) => fetchApi<void>(`/api/competitions/${compId}/members/${memberId}`, { method: "DELETE" }),
    },
    
    documents: {
      create: (compId: string, data: any) => fetchApi<any>(`/api/competitions/${compId}/documents`, { method: "POST", body: JSON.stringify(data) }),
      delete: (compId: string, docId: string) => fetchApi<void>(`/api/competitions/${compId}/documents/${docId}`, { method: "DELETE" }),
    }
  },
  
  tasks: {
    list: (userId?: string) => fetchApi<any[]>(`/api/tasks${userId ? `?userId=${userId}` : ''}`),
    update: (id: string, data: any) => fetchApi<any>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  
  documents: {
    list: (userId?: string) => fetchApi<any[]>(`/api/documents${userId ? `?userId=${userId}` : ''}`),
  }
};
