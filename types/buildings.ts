export interface BuildingFromApi {
  id: number
  address: string
  created_at: string
  apartments: { id: number }[]
}

export interface BuildingDisplay {
  id: number
  name: string
  floors: string | number
  apartments: number
  dateAdded: string
}
