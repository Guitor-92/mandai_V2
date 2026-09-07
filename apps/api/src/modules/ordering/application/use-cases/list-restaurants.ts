import type { RestaurantRepository, RestaurantFilter } from '../../domain/repositories/restaurant.repository';
import type { Restaurant } from '../../domain/entities/restaurant';

// US-01 (descobrir restaurantes) e US-02 (filtrar por categoria).
export class ListRestaurantsUseCase {
  constructor(private readonly restaurantRepo: RestaurantRepository) {}

  execute(input: RestaurantFilter): Promise<Restaurant[]> {
    return this.restaurantRepo.findAll(input);
  }
}
