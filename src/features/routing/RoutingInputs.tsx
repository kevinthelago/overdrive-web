import { useState } from 'react'
import { Segmented } from '@/components/ui/Segmented'
import { Input, FormGroup } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/state/appStore'
import { SERVICE_LEVELS, type ServiceLevel } from './types'

interface RoutingInputsProps {
  onSolve: (serviceLevel: ServiceLevel, quantity: number) => void
  loading: boolean
}

export function RoutingInputs({ onSolve, loading }: RoutingInputsProps) {
  const { selectedProductId, destinationZip, setDestinationZip } = useAppStore()
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>('GROUND')
  const [quantity, setQuantity] = useState(1)
  const [qtyError, setQtyError] = useState<string>()

  function handleSolve() {
    if (!selectedProductId) return
    if (quantity < 1) {
      setQtyError('Must be at least 1')
      return
    }
    setQtyError(undefined)
    onSolve(serviceLevel, quantity)
  }

  const canSolve = Boolean(selectedProductId && destinationZip && !loading)

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4">
      <FormGroup label="Service Level" className="shrink-0">
        <Segmented
          value={serviceLevel}
          onChange={setServiceLevel}
          options={SERVICE_LEVELS}
          size="sm"
        />
      </FormGroup>

      <FormGroup label="Quantity" className="w-24 shrink-0" error={qtyError}>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          error={Boolean(qtyError)}
        />
      </FormGroup>

      <FormGroup label="Ship-to ZIP" className="w-28 shrink-0">
        <Input
          type="text"
          maxLength={5}
          placeholder="00000"
          value={destinationZip}
          onChange={(e) => setDestinationZip(e.target.value.replace(/\D/g, ''))}
        />
      </FormGroup>

      <Button
        onClick={handleSolve}
        disabled={!canSolve}
        loading={loading}
        className="shrink-0"
      >
        Solve
      </Button>

      {!selectedProductId && (
        <p className="text-xs text-text-muted">Select a product in the header to enable routing.</p>
      )}
    </div>
  )
}
