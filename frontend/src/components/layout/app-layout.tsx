import { Outlet } from '@tanstack/react-router'
import { Header } from './header'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
