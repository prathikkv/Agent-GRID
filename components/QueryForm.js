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
        <label htmlFor="query" className="form-label">
          Natural Language Query
        </label>
        
        <div style={{ position: 'relative' }}>
          <textarea
            id="query"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., List diseases in Phase-2 for Imatinib"
            className="form-input"
            disabled={loading}
            required
            style={{ width: '100%', minHeight: '80px' }}
          />
          
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '12px',
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Examples
          </button>
        </div>

        {showExamples && (
          <div style={{
            marginTop: '8px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>
              Example Queries:
            </p>
            <div>
              {EXAMPLE_QUERIES.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => useExampleQuery(example)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="form-label">
          Select Databases
        </label>

        <div className="grid grid-2" style={{ marginTop: '12px' }}>
          {AVAILABLE_DATABASES.map((database) => (
            <label
              key={database}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selectedDatabases.includes(database)}
                onChange={() => handleDatabaseChange(database)}
                style={{ marginRight: '8px' }}
              />
              <span className="text-sm">{database}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !query.trim() || selectedDatabases.length === 0}
          className="btn"
          style={{
            opacity: (loading || !query.trim() || selectedDatabases.length === 0) ? 0.5 : 1
          }}
        >
          {loading ? 'Searching...' : 'Search Databases'}
        </button>
      </div>
    </form>
  )
}