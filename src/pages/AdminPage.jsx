import useStore from '../store/useStore';
import AdminLayout from '../components/Admin/AdminLayout';

export default function AdminPage() {
  const { adminCurrentPage, setAdminCurrentPage, setUser, setSession } = useStore();

  const handleLogout = async () => {
    const { supabase } = await import('../lib/supabase');
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AdminLayout
      currentPage={adminCurrentPage}
      onNavigate={setAdminCurrentPage}
      onLogout={handleLogout}
    />
  );
}
