/**
 * QueryForm component - Handles user input and database selection
 * This component provides the interface for users to enter natural language queries
 * and select which databases they want to search
 */

import { useState } from 'react'

const AVAILABLE_DATABASES = [
  'OpenTargets',
  'ClinicalTrials.gov',
  'ClinVar', 
  'Human Protein Atlas',
  'MGI',
  'ChEMBL',
  'IUPHAR'
]

const EXAMPLE_QUERIES = [
  'List diseases in Phase-2 for Imatinib',
  'List toxicities for Dasatinib',
  'List diseases associated with JAK2',
  'List approved compounds for Alopecia',
  'List interacting partners for TP53'
]

export default function QueryForm({ onSubmit, loading }) {
  const [query, setQuery] = useState('')
  const [selectedDatabases, setSelectedDatabases] = useState(['OpenTargets'])
  const [showExamples, setShowExamples] = useState(false)

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() && selectedDatabases.length > 0) {
      onSubmit(query.trim(), selectedDatabases)
    }
  }

  /**
   * Handle database selection changes
   */
  const handleDatabaseChange = (database) => {
    setSelectedDatabases(prev => {
      if (prev.includes(database)) {
        // Remove database (but keep at least one selected)
        return prev.length > 1 ? prev.filter(db => db !== database) : prev
      } else {
        // Add database
        return [...prev, database]
      }
    })
  }

  /**
   * Select all databases
   */
  const selectAllDatabases = () => {
    setSelectedDatabases(AVAILABLE_DATABASES)
  }

  /**
   * Clear all databases except first one
   */
  const clearDatabases = () => {
    setSelectedDatabases(['OpenTargets'])
  }

  /**
   * Use an example query
   */
  const useExampleQuery = (exampleQuery) => {
    setQuery(exampleQuery)
    setShowExamples(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Query Input */}
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
          Natural Language Query
          <span className="ml-1 text-xs text-gray-500">
            (Ask about drugs, targets, diseases, toxicities, etc.)
          </span>
        </label>
        
        <div className="relative">
          <textarea
            id="query"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., List diseases in Phase-2 for Imatinib"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
            required
          />
          
          {/* Example Queries Button */}
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="absolute top-2 right-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Examples
          </button>
        </div>

        {/* Example Queries Dropdown */}
        {showExamples && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Example Queries:</p>
            <div className="space-y-1">
              {EXAMPLE_QUERIES.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => useExampleQuery(example)}
                  className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Database Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Databases
            <span className="ml-1 text-xs text-gray-500">
              (Choose which databases to search)
            </span>
          </label>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={selectAllDatabases}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Select All
            </button>
            <span className="text-xs text-gray-400">|</span>
            <button
              type="button"
              onClick={clearDatabases}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AVAILABLE_DATABASES.map((database) => (
            <label
              key={database}
              className="relative flex items-start cursor-pointer"
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={selectedDatabases.includes(database)}
                  onChange={() => handleDatabaseChange(database)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <span className="font-medium text-gray-700">{database}</span>
                {/* Tooltips for database descriptions */}
                <div className="text-xs text-gray-500">
                  {database === 'OpenTargets' && 'Drug-target-disease associations'}
                  {database === 'ClinicalTrials.gov' && 'Clinical trial data'}
                  {database === 'ClinVar' && 'Genetic variants'}
                  {database === 'Human Protein Atlas' && 'Protein expression'}
                  {database === 'MGI' && 'Mouse genomics'}
                  {database === 'ChEMBL' && 'Bioactivity data'}
                  {database === 'IUPHAR' && 'Pharmacology data'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedDatabases.length} database{selectedDatabases.length !== 1 ? 's' : ''} selected
        </div>
        
        <button
          type="submit"
          disabled={loading || !query.trim() || selectedDatabases.length === 0}
          className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
            loading || !query.trim() || selectedDatabases.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </div>
          ) : (
            'Search Databases'
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Query Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use drug names (Imatinib, Gleevec) or ChEMBL IDs (CHEMBL941)</li>
          <li>• Specify phases (Phase-2, approved) for clinical trial data</li>
          <li>• Ask about toxicities, diseases, targets, or interactions</li>
          <li>• Try synonyms if no results found (e.g., Gleevec instead of Imatinib)</li>
        </ul>
      </div>
    </form>
  )
}