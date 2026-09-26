export interface ProjectFilterItem {
  categoryId?: string | null;
}

export function selectProjectPage<T extends ProjectFilterItem>(
  projects: readonly T[],
  categoryId: string | null,
  page: number,
  pageSize: number,
): { visible: T[]; totalPages: number; page: number } {
  const filtered = categoryId
    ? projects.filter((project) => project.categoryId === categoryId)
    : [...projects];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return {
    visible: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    totalPages,
    page: currentPage,
  };
}
