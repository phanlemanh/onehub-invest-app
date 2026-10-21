import { UserProfileForm } from "./components/user-profile-form"

export function Page() {
  return (
    <main
      className="bg-background flex min-h-svh w-full justify-center px-4 py-6 sm:px-6 lg:px-8"
      aria-labelledby="page-heading"
    >
      <h1 id="page-heading" className="sr-only">
        User profile form
      </h1>
      <UserProfileForm />
    </main>
  )
}