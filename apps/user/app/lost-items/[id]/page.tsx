/** 데이터 연결 전이라 목 id 로만 정적 생성한다 */
export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }]
}

/** 목록에 없는 id 는 런타임에 만들지 않고 404 로 보낸다 */
export const dynamicParams = false

/** 분실물 상세 */
export default async function LostItemDetailPage({ params }: PageProps<'/lost-items/[id]'>) {
  const { id } = await params
  return <h1>분실물 상세 {id}</h1>
}
