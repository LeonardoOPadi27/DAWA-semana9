'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface SearchMoviesProps {
  apiKey: string
}

interface Movie {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

interface MovieDetails extends Movie {
  Runtime: string
  imdbRating: string
  Plot: string
  Genre: string
  Director: string
  Actors: string
}

export default function SearchMovies({ apiKey }: SearchMoviesProps) {
  const [query, setQuery] = useState('batman')
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const searchMovies = async () => {
      if (!query.trim()) {
        setMovies([])
        setError('')
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`
        )

        const data = await response.json()

        if (data.Response === 'False') {
          setError(data.Error || 'No se encontraron resultados.')
          setMovies([])
        } else {
          setError('')
          setMovies(data.Search || [])
        }
      } catch (error) {
        console.error('Error al buscar películas:', error)
        setError('No se pudo conectar con OMDb.')
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(searchMovies, 500)

    return () => clearTimeout(timeout)
  }, [query, apiKey])

  const getMovieDetails = async (imdbID: string) => {
    try {
      setError('')
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`
      )

      const data = await response.json()
      if (data.Response === 'False') {
        setError(data.Error || 'No se pudieron cargar los detalles.')
        return
      }

      setSelectedMovie(data)
    } catch (error) {
      console.error('Error al obtener detalles:', error)
      setError('No se pudieron cargar los detalles de la película.')
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="bg-white rounded-2xl shadow-2xl p-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        🔍 Búsqueda en Tiempo Real (CSR)
      </h2>

      <input
        type="text"
        placeholder="Buscar películas o series..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-700 mb-6"
      />

      {loading ? (
        <p className="text-blue-600 font-semibold">Buscando...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              onClick={() => getMovieDetails(movie.imdbID)}
              className="cursor-pointer bg-gray-100 rounded-lg p-4 hover:bg-blue-50 transition"
            >
              <h3 className="font-bold text-gray-800">{movie.Title}</h3>
              <p className="text-gray-600">{movie.Year}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {selectedMovie && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-2xl font-bold text-gray-600"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2 gap-6">
              {selectedMovie.Poster !== 'N/A' ? (
                <Image
                  src={selectedMovie.Poster}
                  alt={selectedMovie.Title}
                  width={300}
                  height={450}
                  className="w-full rounded-lg"
                  unoptimized
                />
              ) : (
                <div className="w-full bg-gray-300 h-64 flex items-center justify-center rounded-lg">
                  <span className="text-gray-600">Sin imagen disponible</span>
                </div>
              )}

              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedMovie.Title}
                </h3>

                <p className="text-gray-600 mb-2">
                  {selectedMovie.Year} • {selectedMovie.Runtime}
                </p>

                <p className="text-yellow-600 font-semibold mb-2">
                  ⭐ {selectedMovie.imdbRating}
                </p>

                <p className="text-gray-700 mb-4">
                  {selectedMovie.Plot}
                </p>

                <p className="text-sm text-gray-500">
                  Género: {selectedMovie.Genre}
                </p>

                <p className="text-sm text-gray-500">
                  Director: {selectedMovie.Director}
                </p>

                <p className="text-sm text-gray-500">
                  Actores: {selectedMovie.Actors}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}