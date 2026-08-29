import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col bg-[var(--bg)] pb-20 md:pb-0">
        {children}
      </div>
    </div>
  )
}
