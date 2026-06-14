export interface BaseResponse<T = unknown> {
  success: boolean
  message: string
  messageCode: string
  messageParam?: Record<string, string>
  data?: T
}

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
}
