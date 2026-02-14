import { describe, it, expect } from 'vitest'
import { validateCreateOrderInput } from './create-order.service'

describe('validateCreateOrderInput', () => {
  const futureDateStr = '2099-01-15'
  const pastDateStr = '2020-01-01'

  it('accepts valid input with type monthly', () => {
    const result = validateCreateOrderInput({ type: 'monthly', targetDate: futureDateStr })
    expect(result.success).toBe(true)
  })

  it('accepts valid input with type private_sale', () => {
    const result = validateCreateOrderInput({ type: 'private_sale', targetDate: futureDateStr })
    expect(result.success).toBe(true)
  })

  it('accepts valid input with type special', () => {
    const result = validateCreateOrderInput({ type: 'special', targetDate: futureDateStr })
    expect(result.success).toBe(true)
  })

  it('accepts input with description', () => {
    const result = validateCreateOrderInput({
      type: 'monthly',
      targetDate: futureDateStr,
      description: 'Commande de mars',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('Commande de mars')
    }
  })

  it('rejects an invalid type', () => {
    const result = validateCreateOrderInput({ type: 'invalid', targetDate: futureDateStr })
    expect(result.success).toBe(false)
  })

  it('rejects a missing type', () => {
    const result = validateCreateOrderInput({ targetDate: futureDateStr })
    expect(result.success).toBe(false)
  })

  it('rejects an empty target date', () => {
    const result = validateCreateOrderInput({ type: 'monthly', targetDate: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a target date in the past', () => {
    const result = validateCreateOrderInput({ type: 'monthly', targetDate: pastDateStr })
    expect(result.success).toBe(false)
  })
})
