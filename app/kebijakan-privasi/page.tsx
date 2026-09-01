import { redirect } from 'next/navigation'

/** Alias lama → halaman legal resmi. */
export default function KebijakanPrivasiRedirect() {
  redirect('/privacy-policy')
}
