/** 이미지 업로드 시 어느 리소스의 이미지인지 */
export const IMAGE_RESOURCE_TYPES = [
  'CATEGORY_ICON',
  'PLACE_IMAGE',
  'MENU_IMAGE',
  'PERFORMANCE_IMAGE',
  'LOST_ITEM_IMAGE',
] as const
export type ImageResourceType = (typeof IMAGE_RESOURCE_TYPES)[number]
