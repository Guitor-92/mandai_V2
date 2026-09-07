import type { RestaurantRepository } from '../../domain/repositories/restaurant.repository';
import type { Restaurant } from '../../domain/entities/restaurant';
import { HttpError } from '../../../../shared/errors';

// US-04 (ver cardápio), US-05 (customizar item) e US-09 (restaurante fechado).
export class GetRestaurantUseCase {
  constructor(private readonly restaurantRepo: RestaurantRepository) {}

  async execute(input: { slug: string }): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findBySlug(input.slug);
    if (!restaurant) {
      throw new HttpError(404, `Restaurante "${input.slug}" não encontrado.`);
    }
    return restaurant;
  }
}
