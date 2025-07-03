/**
 * Main page component for the Drug Query Tool
 * This is the entry point that users see when they visit the application
 */

import { useState } from 'react'
import Head from 'next/head'
import QueryForm from '../components/QueryForm'
import ResultsTable from '../components/ResultsTable'
import Visualizations from '../components/visualizations'
import SynonymPrompt from '../components/SynonymPrompt'

export default function Home() {
  // State management for the application
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queryInfo, setQueryInfo] = useState(null)
  const [showSynonymPrompt, setShowSynonymPrompt] = useState(false)
  const [synonymOptions, setSynonymOptions] = useState([])

  /**
   * Handle query submission from the form
   * This function is called when users submit their natural language query
   */
  const handleQuery = async (query, databases) => {
    setLoading(true)
    setError(null)
    
    try {
      // Call our backend API
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
      
      // Update state with results
      setResults(data.data || [])
      setQueryInfo(data.query_info)
      
      // Handle potential synonym ambiguity
      if (data.data.length === 0 && data.query_info?.resolved_entities) {
        // Check if we need to prompt for synonym clarification
        const ambiguousEntities = Object.values(data.query_info.resolved_entities)
          .filter(entity => entity.confidence < 0.8)
        
        if (ambiguousEntities.length > 0) {
          setSynonymOptions(ambiguousEntities)
          setShowSynonymPrompt(true)
        }
      }
      
    } catch (err) {
      console.error('Query error:', err)
      setError(err.message || 'An error occurred while processing your query')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle synonym selection from the disambiguation modal
   */
  const handleSynonymSelection = (selectedSynonym) => {
    setShowSynonymPrompt(false)
    // Re-run query with selected synonym
    // This would involve modifying the original query
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Drug Query Tool - Bioinformatics Database Search</title>
        <meta name="description" content="Search biomedical databases with natural language queries" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Drug Query Tool
          </h1>
          <p className="mt-2 text-gray-600">
            Search biomedical databases using natural language queries
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Query Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <QueryForm onSubmit={handleQuery} loading={loading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Query Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <>
            {/* Query Info */}
            {queryInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Query Information</h3>
                <div className="text-sm text-blue-700">
                  <p><strong>Intent:</strong> {queryInfo.parsed_query?.intent}</p>
                  <p><strong>Databases queried:</strong> {queryInfo.databases_queried?.join(', ')}</p>
                  <p><strong>Total records:</strong> {results.length}</p>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Results</h2>
              </div>
              <ResultsTable data={results} />
            </div>

            {/* Visualizations */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Visualizations</h2>
              </div>
              <div className="p-6">
                <Visualizations data={results} queryInfo={queryInfo} />
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
            <p className="mt-1 text-sm text-gray-500">Enter a query above to search biomedical databases</p>
          </div>
        )}
      </main>

      {/* Synonym Prompt Modal */}
      {showSynonymPrompt && (
        <SynonymPrompt
          options={synonymOptions}
          onSelect={handleSynonymSelection}
          onClose={() => setShowSynonymPrompt(false)}
        />
      )}
    </div>
  )
}
