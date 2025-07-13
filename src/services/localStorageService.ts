interface StorageData {
  leads: any[];
  documents: any[];
  workflows: any[];
  analytics: any;
}

const STORAGE_KEY = "crm_data";

export const getStorageData = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }

  return {
    leads: [],
    documents: [],
    workflows: [],
    analytics: {},
  };
};

export const saveStorageData = (data: StorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const addDocument = (document: any): void => {
  const data = getStorageData();
  data.documents.push({
    ...document,
    id: Date.now().toString(),
    uploadedAt: new Date().toISOString(),
  });
  saveStorageData(data);
};

export const addWorkflow = (workflow: any): void => {
  const data = getStorageData();
  data.workflows.push({
    ...workflow,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  });
  saveStorageData(data);
};

export const getDocuments = () => {
  return getStorageData().documents;
};

export const getWorkflows = () => {
  return getStorageData().workflows;
};

export const updateAnalytics = (analytics: any): void => {
  const data = getStorageData();
  data.analytics = {
    ...data.analytics,
    ...analytics,
    lastUpdated: new Date().toISOString(),
  };
  saveStorageData(data);
};
