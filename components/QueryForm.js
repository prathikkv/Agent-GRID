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
  'List approved compounds for Alopecia'
]

export default function QueryForm({ onSubmit, loading }) {
  const [query, setQuery] = useState('')
  const [selectedDatabases, setSelectedDatabases] = useState(['OpenTargets'])
  const [showExamples, setShowExamples] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() && selectedDatabases.length > 0) {
      onSubmit(query.trim(), selectedDatabases)
    }
  }

  const handleDatabaseChange = (database) => {
    setSelectedDatabases(prev => {
      if (prev.includes(database)) {
        return prev.length > 1 ? prev.filter(db => db !== database) : prev
      } else {
        return [...prev, database]
      }
    })
  }

  const useExampleQuery = (exampleQuery) => {
    setQuery(exampleQuery)
    setShowExamples(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
          Natural Language Query
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
          
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="absolute top-2 right-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Examples
          </button>
        </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Databases
        </label>

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
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !query.trim() || selectedDatabases.length === 0}
          className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
            loading || !query.trim() || selectedDatabases.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Searching...' : 'Search Databases'}
        </button>
      </div>
    </form>
  )
}