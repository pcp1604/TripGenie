import { Project, User, UserRole } from "./types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Chen',
  email: 'alex.chen@stratai.enterprise.com',
  role: UserRole.CONSULTANT,
  company: 'StratAI Global',
  avatarUrl: 'https://picsum.photos/200'
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Cloud Migration Strategy 2025',
    client: 'Acme Corp',
    status: 'Active',
    dueDate: '2024-12-15',
    progress: 65,
    description: 'Moving legacy on-premise ERP systems to Hybrid Cloud architecture.',
    contextSnippet: 'Acme Corp is a logistics giant with 5000 employees. They use SAP legacy on-prem. Main pain points are scalability and maintenance costs. Budget is $5M.'
  },
  {
    id: 'p2',
    title: 'AI Customer Support Implementation',
    client: 'FinTech Solutions',
    status: 'Planning',
    dueDate: '2025-01-20',
    progress: 15,
    description: 'Implementing GenAI chatbots for Tier 1 support to reduce call volume.',
    contextSnippet: 'FinTech Solutions handles sensitive financial data. Security is paramount. They have 100 support agents handling 10k tickets/week.'
  },
  {
    id: 'p3',
    title: 'Data Governance Framework',
    client: 'HealthPlus',
    status: 'Review',
    dueDate: '2024-11-30',
    progress: 90,
    description: 'Establishing HIPAA compliant data lakes and governance policies.',
    contextSnippet: 'HealthPlus deals with patient records. Need strict role-based access control (RBAC) and audit trails.'
  }
];
