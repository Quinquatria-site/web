import { Table, type TableColumn } from '../ui'

export interface Booth {
  id: string
  name: string
  category: 'food' | 'experience' | 'goods' | 'exhibit'
  club: string
  published: boolean
}

const CATEGORY_LABEL: Record<Booth['category'], string> = {
  food: '음식',
  experience: '체험',
  goods: '판매',
  exhibit: '전시',
}

const COLUMNS: TableColumn<Booth>[] = [
  { key: 'name', header: '부스명', render: (booth) => booth.name },
  {
    key: 'category',
    header: '분류',
    width: '6rem',
    render: (booth) => CATEGORY_LABEL[booth.category],
  },
  { key: 'club', header: '운영 동아리', render: (booth) => booth.club },
  {
    key: 'published',
    header: '공개',
    align: 'center',
    width: '6rem',
    render: (booth) => (booth.published ? '공개' : '비공개'),
  },
]

export function BoothTable({ booths }: { booths: Booth[] }) {
  return (
    <Table
      columns={COLUMNS}
      rows={booths}
      rowKey={(booth) => booth.id}
      emptyMessage="아직 등록된 부스가 없습니다"
    />
  )
}
