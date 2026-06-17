import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Revenue" value="$1,234" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$1,234')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<StatCard label="Revenue" value="$0" loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('$0')).not.toBeInTheDocument()
  })

  it('shows dash when empty', () => {
    render(<StatCard label="Revenue" value="$0" empty />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders trend label', () => {
    render(<StatCard label="Revenue" value="$1,234" trend="up" trendLabel="+12%" />)
    expect(screen.getByText(/\+12%/)).toBeInTheDocument()
  })
})
