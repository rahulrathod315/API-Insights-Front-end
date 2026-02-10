export interface Endpoint {
  id: number
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  name: string
  description: string
  is_active: boolean
  request_count: number
  created_at: string
  updated_at: string
}

export interface CreateEndpointRequest {
  path: string
  method?: string
  name?: string
  description?: string
}

export interface UpdateEndpointRequest {
  name?: string
  description?: string
  is_active?: boolean
}

export interface EndpointFilters {
  search?: string
  method?: string
  is_active?: boolean
}
