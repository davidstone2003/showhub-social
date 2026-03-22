import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Shield, ShieldOff, Mail, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  account_type: string;
  email_verified: boolean;
  created_at: string;
  is_premium: boolean;
  logo_url: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name, first_name, last_name, account_type, email_verified, created_at, is_premium, logo_url").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setUsers((profileData as UserProfile[]) || []);
    setRoles((rolesData as UserRole[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const getUserRoles = (userId: string) => roles.filter((r) => r.user_id === userId).map((r) => r.role);

  const toggleAdmin = async (userId: string) => {
    const isCurrentlyAdmin = getUserRoles(userId).includes("admin");
    if (isCurrentlyAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      toast.success("Admin role removed");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as any });
      toast.success("Admin role granted");
    }
    fetchUsers();
  };

  const deleteUser = async () => {
    if (!deleteUserId) return;
    // Delete related data first, then profile
    await supabase.from("user_roles").delete().eq("user_id", deleteUserId);
    await supabase.from("notifications").delete().eq("user_id", deleteUserId);
    await supabase.from("winners").update({ user_id: null } as any).eq("user_id", deleteUserId);
    await supabase.from("breeder_profiles").delete().eq("owner_user_id", deleteUserId);
    await supabase.from("profiles").delete().eq("id", deleteUserId);
    toast.success("User account deleted");
    setDeleteUserId(null);
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.last_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role: string) => {
    if (role === "admin") return "bg-primary/10 text-primary";
    if (role === "moderator") return "bg-amber-100 text-amber-800";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} users</p>

      {loading ? (
        <p className="text-muted-foreground text-center py-8 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">No users found</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const userRoles = getUserRoles(u.id);
            const isAdmin = userRoles.includes("admin");
            return (
              <div key={u.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                {u.logo_url ? (
                  <img src={u.logo_url} alt="" className="w-10 h-10 rounded-full object-cover bg-muted flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      {(u.first_name || u.username)?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground text-sm truncate">
                      {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.display_name || u.username}
                    </p>
                    {u.email_verified ? (
                      <MailCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    {userRoles.map((r) => (
                      <span key={r} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadge(r)}`}>{r}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{u.username} · {u.account_type} · Joined {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAdmin(u.id)}
                    title={isAdmin ? "Remove admin" : "Make admin"}
                  >
                    {isAdmin ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteUserId(u.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user's profile, roles, and notifications. Their posts will be preserved but unlinked. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
