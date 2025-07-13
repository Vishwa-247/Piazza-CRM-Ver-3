
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "contacted";
  source: string;
  createdAt: Date;
}

export interface AppData {
  leads: Lead[];
  lastMonthLeads: number;
  createdAt: string;
}

const STORAGE_KEY = 'mini-crm-data';

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      data.leads = data.leads.map(
        (lead: Omit<Lead, "createdAt"> & { createdAt: string }) => ({
          ...lead,
          createdAt: new Date(lead.createdAt),
        })
      );
      return data;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }

  // Return empty initial data - no dummy data
  return {
    leads: [],
    lastMonthLeads: 0,
    createdAt: new Date().toISOString(),
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>): Lead => {
  const data = loadData();
  const newLead: Lead = {
    ...lead,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  
  data.leads.unshift(newLead);
  saveData(data);
  return newLead;
};

export const updateLead = (id: string, updates: Partial<Lead>): void => {
  const data = loadData();
  const index = data.leads.findIndex(lead => lead.id === id);
  if (index !== -1) {
    data.leads[index] = { ...data.leads[index], ...updates };
    saveData(data);
  }
};

export const deleteLead = (id: string): void => {
  const data = loadData();
  data.leads = data.leads.filter(lead => lead.id !== id);
  saveData(data);
};

export const calculateGrowthPercentage = (currentLeads: Lead[]): number => {
  const data = loadData();
  const currentCount = currentLeads.length;
  const lastMonthCount = data.lastMonthLeads;
  
  if (lastMonthCount === 0 && currentCount === 0) return 0;
  if (lastMonthCount === 0) return 100;
  return Math.round(((currentCount - lastMonthCount) / lastMonthCount) * 100);
};
