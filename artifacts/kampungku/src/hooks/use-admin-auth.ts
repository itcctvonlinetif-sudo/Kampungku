import { useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function useAdminAuth() {
  const { data: adminMe, isLoading, isError } = useGetAdminMe({
    query: {
      retry: false,
    }
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!adminMe?.isAuthenticated || isError)) {
      setLocation("/admin/login");
    }
  }, [isLoading, adminMe, isError, setLocation]);

  return {
    isAuthenticated: adminMe?.isAuthenticated ?? false,
    username: adminMe?.username,
    isLoading
  };
}
