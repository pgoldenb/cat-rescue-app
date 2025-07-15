import { Decimal } from '@prisma/client/runtime/library'

/**
 * Transform Prisma data for client components by converting Decimal to number
 */
export function transformCatForClient(cat: any) {
  return {
    ...cat,
    latitude: cat.latitude instanceof Decimal ? cat.latitude.toNumber() : Number(cat.latitude),
    longitude: cat.longitude instanceof Decimal ? cat.longitude.toNumber() : Number(cat.longitude),
    address: cat.address || null,
    dateAdded: cat.dateAdded instanceof Date ? cat.dateAdded : new Date(cat.dateAdded),
    createdAt: cat.createdAt instanceof Date ? cat.createdAt : new Date(cat.createdAt),
    updatedAt: cat.updatedAt instanceof Date ? cat.updatedAt : new Date(cat.updatedAt),
    statusHistory: cat.statusHistory?.map((entry: any) => ({
      ...entry,
      updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt : new Date(entry.updatedAt)
    })) || []
  }
}

/**
 * Transform multiple cats for client components
 */
export function transformCatsForClient(cats: any[]) {
  return cats.map(transformCatForClient)
}

/**
 * Transform caretaker data for client components
 */
export function transformCaretakerForClient(caretaker: any) {
  return {
    ...caretaker,
    latitude: caretaker.latitude instanceof Decimal ? caretaker.latitude.toNumber() : caretaker.latitude,
    longitude: caretaker.longitude instanceof Decimal ? caretaker.longitude.toNumber() : caretaker.longitude,
    createdAt: caretaker.createdAt instanceof Date ? caretaker.createdAt : new Date(caretaker.createdAt),
    updatedAt: caretaker.updatedAt instanceof Date ? caretaker.updatedAt : new Date(caretaker.updatedAt)
  }
}

/**
 * Transform multiple caretakers for client components
 */
export function transformCaretakersForClient(caretakers: any[]) {
  return caretakers.map(transformCaretakerForClient)
}
