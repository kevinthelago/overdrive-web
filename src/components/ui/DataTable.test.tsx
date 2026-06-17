import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type ColumnDef } from './DataTable'

interface Row {
  id: number
  name: string
  value: number
}

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true },
  { key: 'value', header: 'Value', cell: (r) => r.value, sortable: true, align: 'right' },
]

const data: Row[] = [
  { id: 1, name: 'Alpha', value: 100 },
  { id: 2, name: 'Beta', value: 200 },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(r) => r.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders all rows', () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(r) => r.id} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows empty state when data is empty', () => {
    render(
      <DataTable columns={columns} data={[]} keyExtractor={(r) => r.id} empty="Nothing here" />,
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} keyExtractor={(r) => r.id} loading />,
    )
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('calls onSortChange when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onSortChange={onSortChange}
      />,
    )
    await user.click(screen.getByText('Name'))
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc')
  })
})
