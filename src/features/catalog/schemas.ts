import { z } from 'zod';

export const productSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or fewer')
    .regex(/^[A-Z0-9_-]+$/i, 'SKU may only contain letters, digits, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or fewer'),
  category: z.enum(['STANDARD', 'PERISHABLE', 'HAZMAT', 'DANGEROUS_GOODS', 'HIGH_VALUE'], {
    required_error: 'Category is required',
  }),
  weightLb: z
    .number({ required_error: 'Weight is required', invalid_type_error: 'Weight must be a number' })
    .positive('Weight must be greater than 0')
    .max(150, 'Weight must be 150 lb or less'),
  lengthIn: z
    .number({ required_error: 'Length is required', invalid_type_error: 'Length must be a number' })
    .positive('Length must be greater than 0')
    .max(108, 'Length must be 108 in or less'),
  widthIn: z
    .number({ required_error: 'Width is required', invalid_type_error: 'Width must be a number' })
    .positive('Width must be greater than 0')
    .max(108, 'Width must be 108 in or less'),
  heightIn: z
    .number({ required_error: 'Height is required', invalid_type_error: 'Height must be a number' })
    .positive('Height must be greater than 0')
    .max(108, 'Height must be 108 in or less'),
  declaredValue: z
    .number({ invalid_type_error: 'Declared value must be a number' })
    .nonnegative('Declared value must be 0 or greater')
    .optional()
    .or(z.literal('')),
  active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const warehouseSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(10, 'Code must be 10 characters or fewer')
    .regex(/^[A-Z0-9]+$/i, 'Code may only contain letters and digits'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or fewer'),
  street: z.string().min(1, 'Street is required').max(200, 'Street must be 200 characters or fewer'),
  city: z.string().min(1, 'City is required').max(100, 'City must be 100 characters or fewer'),
  state: z.string().length(2, 'State must be a 2-letter US state code'),
  zip: z
    .string()
    .min(1, 'ZIP is required')
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 5 digits or ZIP+4 format'),
  active: z.boolean().default(true),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;

export const carrierSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(10, 'Code must be 10 characters or fewer')
    .regex(/^[A-Z0-9_-]+$/i, 'Code may only contain letters, digits, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or fewer'),
  active: z.boolean().default(true),
});

export type CarrierFormData = z.infer<typeof carrierSchema>;

export const serviceLevelSchema = z.object({
  carrierId: z.string().uuid('A valid carrier must be selected'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(20, 'Code must be 20 characters or fewer')
    .regex(/^[A-Z0-9_-]+$/i, 'Code may only contain letters, digits, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or fewer'),
  minTransitDays: z
    .number({ required_error: 'Min transit days is required', invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1 day')
    .max(90, 'Must be 90 days or fewer'),
  maxTransitDays: z
    .number({ required_error: 'Max transit days is required', invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1 day')
    .max(90, 'Must be 90 days or fewer'),
  active: z.boolean().default(true),
}).refine((data) => data.maxTransitDays >= data.minTransitDays, {
  message: 'Max transit days must be ≥ min transit days',
  path: ['maxTransitDays'],
});

export type ServiceLevelFormData = z.infer<typeof serviceLevelSchema>;

export const rateTableSchema = z.object({
  carrierId: z.string().uuid('A valid carrier must be selected'),
  serviceLevelId: z.string().uuid('A valid service level must be selected'),
  originZone: z.string().min(1, 'Origin zone is required').max(10, 'Must be 10 characters or fewer'),
  destZone: z.string().min(1, 'Destination zone is required').max(10, 'Must be 10 characters or fewer'),
  weightMinLb: z
    .number({ required_error: 'Min weight is required', invalid_type_error: 'Must be a number' })
    .nonnegative('Must be 0 or greater'),
  weightMaxLb: z
    .number({ required_error: 'Max weight is required', invalid_type_error: 'Must be a number' })
    .positive('Must be greater than 0')
    .max(150, 'Must be 150 lb or less'),
  rateCents: z
    .number({ required_error: 'Rate is required', invalid_type_error: 'Must be a number' })
    .nonnegative('Rate must be 0 or greater'),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)'),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.weightMaxLb > data.weightMinLb, {
  message: 'Max weight must be greater than min weight',
  path: ['weightMaxLb'],
});

export type RateTableFormData = z.infer<typeof rateTableSchema>;
