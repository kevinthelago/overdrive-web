import { useCallback } from 'react'
import { ApiError } from '@/lib/api'

export interface ToastHandle {
  showError: (title: string, description?: string) => void
}

/**
 * Returns a handler that converts an ApiError into a toast notification.
 * Pass the toast callback from the app's toast context or store.
 */
export function useApiError(showError: (title: string, description?: string) => void) {
  return useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        const title = error.isServerError
          ? 'Server error'
          : error.isUnauthorized
            ? 'Session expired'
            : error.isForbidden
              ? 'Access denied'
              : 'Request failed'
        showError(title, error.message)
      } else if (error instanceof Error) {
        showError('Unexpected error', error.message)
      } else {
        showError('Unexpected error')
      }
    },
    [showError],
  )
}
