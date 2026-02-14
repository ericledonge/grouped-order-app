import dayjs from 'dayjs'
import 'dayjs/locale/fr-ca'

export function formatDate(iso: string): string {
  return dayjs(iso).locale('fr-ca').format('D MMMM YYYY')
}
