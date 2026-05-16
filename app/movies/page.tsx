import Image from 'next/image'
import SearchMovies from './SearchMovies'

const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || ''

interface Movie {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

async function getPopularMovies(): Promise<Movie[]> {
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&s=marvel`,
    {
      cache: 'no-store'
    }
  )

  const data = await response.json()

  if (data.Response === 'False') {
    console.error('OMDb SSR error:', data.Error)
    return []
  }

  return data.Search || []
}

export default async function MoviesPage() {
  const movies = await getPopularMovies()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          🎬 Galería de Películas y Series
        </h1>

        <SearchMovies apiKey={API_KEY} />

        <h2 className="text-3xl font-bold text-white mt-12 mb-6">
          ⭐ Películas Populares (SSR)
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {movie.Poster !== 'N/A' ? (
                <Image
                  src={movie.Poster}
                  alt={movie.Title}
                  width={300}
                  height={450}
                  className="w-full h-96 object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-96 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">Sin imagen</span>
                </div>
              )}

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {movie.Title}
                </h3>

                <p className="text-gray-600">{movie.Year}</p>

                <p className="text-sm text-blue-600 mt-2 capitalize">
                  {movie.Type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}