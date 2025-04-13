export const fetchCategoryDetail = async (categoryId: string) => {
  const res = await fetch(`/api/category/${categoryId}`)
  if (!res.ok) throw new Error('Failed to fetch images')
  return res.json()
}
