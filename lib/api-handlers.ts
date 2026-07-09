type UnauthorizedHandler = () => void
type ForbiddenHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null
let onForbidden: ForbiddenHandler | null = null

export function setApiErrorHandlers(handlers: {
  onUnauthorized?: UnauthorizedHandler
  onForbidden?: ForbiddenHandler
}): void {
  onUnauthorized = handlers.onUnauthorized ?? null
  onForbidden = handlers.onForbidden ?? null
}

export function notifyUnauthorized(): void {
  onUnauthorized?.()
}

export function notifyForbidden(): void {
  onForbidden?.()
}

export function clearApiErrorHandlers(): void {
  onUnauthorized = null
  onForbidden = null
}
