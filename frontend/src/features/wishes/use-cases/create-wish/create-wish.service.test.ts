import { describe, it, expect } from 'vitest'
import { validateCreateWishInput } from './create-wish.service'

describe('validateCreateWishInput', () => {
  it('accepte un input valide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
    })
    expect(result.success).toBe(true)
  })

  it('accepte un input avec URL', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
      philibertUrl: 'https://www.philibert.com/terraforming-mars',
    })
    expect(result.success).toBe(true)
  })

  it('accepte une URL vide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
      philibertUrl: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un nom de jeu vide', () => {
    const result = validateCreateWishInput({
      gameName: '',
      philibertReference: 'PHI-12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un nom de jeu manquant', () => {
    const result = validateCreateWishInput({
      philibertReference: 'PHI-12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejette une référence vide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejette une URL invalide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
      philibertUrl: 'pas-une-url',
    })
    expect(result.success).toBe(false)
  })
})
