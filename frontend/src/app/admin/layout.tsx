import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="grid-bg flex min-h-screen">
        <Sidebar variant="admin" />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
          <Navbar title="Welcome back, Admin" />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
