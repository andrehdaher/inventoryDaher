import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getFirstAccessibleNavigationPath,
  InventoryUserWithPermissions,
} from "@/config/permissions";

function getStoredUser(): InventoryUserWithPermissions | null {
  try {
    const storedUser = localStorage.getItem("InventoryUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const firstAllowedPath = getFirstAccessibleNavigationPath(user);

  const content = (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold text-destructive">
        ليس لديك صلاحية الوصول لهذه الصفحة
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        يمكنك الرجوع إلى صفحة مسموحة لك من القائمة الجانبية أو استخدام الزر أدناه.
      </p>
      <Button
        className="mt-5 w-full max-w-xs"
        variant="destructive"
        onClick={() => {
          if (user && firstAllowedPath !== "/unauthorized") {
            navigate(firstAllowedPath, { replace: true });
            return;
          }

          navigate("/login", { replace: true });
        }}
      >
        {user ? "الذهاب إلى صفحة مسموحة" : "تسجيل الدخول"}
      </Button>
    </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
}
