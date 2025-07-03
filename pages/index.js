import { useState } from 'react'
import Head from 'next/head'
import QueryForm from '../components/QueryForm'
import ResultsTable from '../components/ResultsTable'
import Visualizations from '../components/Visualizations'

export default function Home() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queryInfo, setQueryInfo] = useState(null)

  const handleQuery = async (query, databases) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          databases
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setResults(data.data || [])
      setQueryInfo(data.query_info)
      
    } catch (err) {
      console.error('Query error:', err)
      setError(err.message || 'An error occurred while processing your query')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Drug Query Tool - Bioinformatics Database Search</title>
        <meta name="description" content="Search biomedical databases with natural language queries" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow border-b">
        <div className="container">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Drug Query Tool
            </h1>
            <p className="mt-2 text-gray-600">
              Search biomedical databases using natural language queries
            </p>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="p-6">
          
          <div className="bg-white rounded shadow p-6 mb-8">
            <QueryForm onSubmit={handleQuery} loading={loading} />
          </div>

          {error && (
            <div className="error mb-8">
              <h3 className="font-medium">Query Error</h3>
              <div className="mt-2">
                {error}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <>
              {queryInfo && (
                <div className="success mb-6">
                  <h3 className="text-sm font-medium mb-2">Query Information</h3>
                  <div className="text-sm">
                    <p><strong>Intent:</strong> {queryInfo.parsed_query?.intent}</p>
                    <p><strong>Databases queried:</strong> {queryInfo.databases_queried?.join(', ')}</p>
                    <p><strong>Total records:</strong> {results.length}</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded shadow mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Results</h2>
                </div>
                <ResultsTable data={results} />
              </div>

              <div className="bg-white rounded shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Visualizations</h2>
                </div>
                <div className="p-6">
                  <Visualizations data={results} queryInfo={queryInfo} />
                </div>
              </div>
            </>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="text-center p-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
              <p className="mt-1 text-sm text-gray-500">Enter a query above to search biomedical databases</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}