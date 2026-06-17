import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormField';
import type { OverrideDraft, OverrideType } from './types';

const OVERRIDE_LABELS: Record<OverrideType, string> = {
  ADD_WAREHOUSE: 'Add Warehouse',
  REMOVE_WAREHOUSE: 'Remove Warehouse',
  ADD_CARRIER: 'Add Carrier',
  REMOVE_CARRIER: 'Remove Carrier',
  SUPPLIER_PRICE_DELTA: 'Supplier Price Delta',
  FEE_SCHEDULE_CHANGE: 'Fee Schedule Change',
  DEMAND_FACTOR_CHANGE: 'Demand Factor Change',
};

const OVERRIDE_TYPES = Object.keys(OVERRIDE_LABELS) as OverrideType[];

const needsValue = (type: OverrideType) =>
  type === 'SUPPLIER_PRICE_DELTA' ||
  type === 'FEE_SCHEDULE_CHANGE' ||
  type === 'DEMAND_FACTOR_CHANGE';

const valueLabel: Record<OverrideType, string> = {
  ADD_WAREHOUSE: '',
  REMOVE_WAREHOUSE: '',
  ADD_CARRIER: '',
  REMOVE_CARRIER: '',
  SUPPLIER_PRICE_DELTA: 'Delta (%)',
  FEE_SCHEDULE_CHANGE: 'New Fee Amount',
  DEMAND_FACTOR_CHANGE: 'Factor Multiplier',
};

const entityLabel: Record<OverrideType, string> = {
  ADD_WAREHOUSE: 'Warehouse ID',
  REMOVE_WAREHOUSE: 'Warehouse ID',
  ADD_CARRIER: 'Carrier ID',
  REMOVE_CARRIER: 'Carrier ID',
  SUPPLIER_PRICE_DELTA: 'Supplier ID',
  FEE_SCHEDULE_CHANGE: 'Carrier ID',
  DEMAND_FACTOR_CHANGE: 'Product ID',
};

interface Props {
  value: OverrideDraft;
  onChange: (next: OverrideDraft) => void;
  onRemove: () => void;
}

export function OverrideEditor({ value, onChange, onRemove }: Props) {
  const handleTypeChange = (type: OverrideType) => {
    onChange({ type, entityId: '', value: undefined });
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">Override Type</label>
          <Select
            value={value.type}
            onValueChange={(v) => handleTypeChange(v as OverrideType)}
            options={OVERRIDE_TYPES.map((t) => ({ label: OVERRIDE_LABELS[t], value: t }))}
          />
        </div>
        <Button variant="ghost" size="sm" className="mt-5 text-red-400" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            {entityLabel[value.type]}
          </label>
          <Input
            value={value.entityId}
            onChange={(e) => onChange({ ...value, entityId: e.target.value })}
            placeholder={entityLabel[value.type]}
          />
        </div>

        {needsValue(value.type) && (
          <div className="w-36">
            <label className="mb-1 block text-xs text-muted-foreground">
              {valueLabel[value.type]}
            </label>
            <Input
              type="number"
              value={value.value ?? ''}
              onChange={(e) =>
                onChange({ ...value, value: e.target.value === '' ? undefined : Number(e.target.value) })
              }
              placeholder="0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
