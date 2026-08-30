export type Nullable<T> = T | null
export type Maybe<T> = T | null | undefined

export interface Paginated<T> {
  items: T[]
  total: number
}
