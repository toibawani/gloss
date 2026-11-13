import { Empty } from '../components/States'

export function NotFound() {
  return (
    <Empty
      title="This page does not exist"
      text="The link may be old or mistyped. Home has both open chapters."
      action={{ label: 'Go to Home', href: '#/' }}
    />
  )
}
