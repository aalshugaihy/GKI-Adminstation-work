
export type Language = 'en' | 'ar';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SECTOR_ADMIN = 'SECTOR_ADMIN',
  SERVICE_OWNER = 'SERVICE_OWNER',
  PMO_ANALYST = 'PMO_ANALYST',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  EXECUTIVE_VIEWER = 'EXECUTIVE_VIEWER',
  EXTERNAL_PARTNER = 'EXTERNAL_PARTNER',
}

export type ModuleName = 'STRATEGY' | 'KNOWLEDGE' | 'PROJECTS' | 'MEETINGS' | 'REPORTS' | 'ADMIN';

export enum Permission {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE_REJECT = 'APPROVE_REJECT',
  EXPORT = 'EXPORT',
  MANAGE_TEMPLATES = 'MANAGE_TEMPLATES',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
}

export interface RoleDefinition {
  id: Role | string;
  nameEn: string;
  nameAr: string;
  globalPermissions: Permission[];
  modulePermissions: Record<ModuleName, Permission[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: ModuleName | 'SYSTEM';
  timestamp: string;
  ip: string;
  type: 'RBAC_CHANGE' | 'DATA_ACCESS' | 'USER_MANAGEMENT' | 'LOGIN' | 'HEALTH_UPDATE' | 'PROJECT_BASELINE' | 'TASK_DRAG';
}

export interface Task {
  id: string;
  titleEn: string;
  titleAr: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  dueDate?: string;
  startDate?: string;
  dependencies?: string[]; // Array of task IDs
  parentId?: string; // ID of parent task for hierarchy
  subtasks?: Task[];
}

export interface ProjectRisk {
  id: string;
  descriptionEn: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ProjectBaseline {
  startDate: string;
  endDate: string;
  budgetEn: string;
  budgetAr: string;
  progress: number;
  timestamp: string; // Audit requirement
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: 'Initiation' | 'Planning' | 'Execution' | 'Monitoring' | 'Closing';
  progress: number;
  health: 'on-track' | 'at-risk' | 'off-track';
  startDate: string;
  endDate: string;
  budgetEn: string;
  budgetAr: string;
  tasks: Task[];
  risks: ProjectRisk[];
  hasOverdueTasks?: boolean;
  baseline?: ProjectBaseline;
}

export interface RetentionPolicy {
  id: string;
  dataTypeEn: string;
  dataTypeAr: string;
  periodMonths: number;
  action: 'Archive' | 'Delete';
}

export interface KPI {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: 'up' | 'down' | 'stable';
}

export interface NavItem {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  path: string;
  requiredPermission?: Permission;
  requiredModule?: ModuleName;
}
