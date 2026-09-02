/**
 * Operasi saldo / poin: tunggu konfirmasi server.
 * Jangan pakai optimisticData; rollback palsu bisa menampilkan saldo yang salah.
 */
export const BALANCE_MUTATE_OPTIONS = {
  optimisticData: undefined,
  rollbackOnError: false,
  revalidate: true,
  populateCache: true,
} as const
