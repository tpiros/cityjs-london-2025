import { z } from 'zod';

export const starWarsFilmSchema = z
  .object({
    films: z.array(
      z.object({
        title: z.string().describe('Title of the film'),
        released: z.string().date().describe('Release date of the film'),
        characters: z.string().describe('Notable characters in the film'),
        plot: z.string().describe("Short summary of the film's plot"),
      })
    ),
  })
  .describe('Array of original Star Wars films with details');
