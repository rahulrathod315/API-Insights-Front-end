export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  results: T[]
  pagination: {
    count: number
    total_pages: number
    current_page: number
    page_size: number
    next: string | null
    previous: string | null
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    request_id?: string
  }
}

export interface PaginationParams {
  page?: number
  page_size?: number
}
