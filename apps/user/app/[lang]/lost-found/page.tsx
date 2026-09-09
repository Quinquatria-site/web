import { PageHeader } from '@/components/page-header'
import { COPY, type Lang } from '@/libs/i18n'

export default async function Page({ params }: PageProps<'/[lang]/lost-found'>) {
  const { lang } = (await params) as { lang: Lang }
  const { label, summary } = COPY[lang].pages['/lost-found']
  return <PageHeader title={label} description={summary} />
}
