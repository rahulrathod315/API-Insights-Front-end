export interface Project {
  id: number
  name: string
  description: string
  api_key: string
  is_active: boolean
  endpoints_count: number
  total_requests: number
  my_role: 'owner' | 'admin' | 'member' | 'viewer'
  created_at: string
  updated_at: string
}

export interface ProjectDetail extends Project {
  endpoints: ProjectEndpoint[]
}

export interface ProjectEndpoint {
  id: number
  path: string
  method: string
  name: string
  description: string
  is_active: boolean
  request_count: number
  created_at: string
  updated_at: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  is_active?: boolean
}
