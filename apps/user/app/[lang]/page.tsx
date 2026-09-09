import { LandingSection } from '@/domains/home/components/landing-section'
import type { Lang } from '@/libs/i18n'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = (await params) as { lang: Lang }
  return <LandingSection lang={lang} />
}
