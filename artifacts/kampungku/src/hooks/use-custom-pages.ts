import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type WebsiteLink = {
  label: string;
  url: string;
};

export type CustomPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  showInNav: boolean;
  sortOrder: number;
  imageUrls: string[];
  websiteLinks: WebsiteLink[];
  videoUrls: string[];
  createdAt: string;
  updatedAt: string;
};

const BASE = "/api/custom-pages";

export function useListCustomPages() {
  return useQuery<CustomPage[]>({
    queryKey: [BASE],
    queryFn: async () => {
      const res = await fetch(BASE);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

export function useGetCustomPage(slug: string) {
  return useQuery<CustomPage>({
    queryKey: [BASE, slug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCreateCustomPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CustomPage, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      return res.json() as Promise<CustomPage>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BASE] }),
  });
}

export function useUpdateCustomPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CustomPage> }) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      return res.json() as Promise<CustomPage>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BASE] }),
  });
}

export function useDeleteCustomPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BASE] }),
  });
}
