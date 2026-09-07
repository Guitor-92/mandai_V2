import type { RestaurantRepository, SearchResult } from '../../domain/repositories/restaurant.repository';

// US-03 — busca por nome de restaurante ou prato.
export class SearchUseCase {
  constructor(private readonly restaurantRepo: RestaurantRepository) {}

  execute(input: { q: string }): Promise<SearchResult> {
    return this.restaurantRepo.search(input.q);
  }
}
