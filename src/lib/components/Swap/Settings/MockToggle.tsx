import { useAtom } from 'jotai'
import { mockTogglableAtom } from 'lib/state/settings'

import Row from '../../Row'
import Toggle from '../../Toggle'
import { Label } from './components'

export default function MockToggle() {
  const [mockTogglable, toggleMockTogglable] = useAtom(mockTogglableAtom)
  return (
    <Row>
      <Label name={"Mock Toggle"} />
      <Toggle checked={mockTogglable} onToggle={toggleMockTogglable} />
    </Row>
  )
}
