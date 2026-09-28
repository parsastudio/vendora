export interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryNode[];
}

export function buildCategoryTree<T extends { id: string; name: string; parentId: string | null }>(
  list: T[],
  parentId: string | null = null,
): CategoryNode[] {
  return list
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      parentId: item.parentId,
      children: buildCategoryTree(list, item.id),
    }));
}
