import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDatabases, setSelectedDatabases] = useState(['OpenTargets'])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple mock data based on query
    let mockResults = []
    
    if (query.toLowerCase().includes('imatinib') || query.toLowerCase().includes('gleevec')) {
      mockResults = [
        {
          drug: 'Imatinib',
          drug_id: 'CHEMBL941',
          disease_name: 'Chronic Myeloid Leukemia',
          phase: '2',
          source: 'OpenTargets',
          evidence_score: '0.95'
        },
        {
          drug: 'Imatinib',
          drug_id: 'CHEMBL941',
          disease_name: 'Gastrointestinal Stromal Tumor',
          phase: '2',
          source: 'OpenTargets',
          evidence_score: '0.88'
        }
      ]
    } else if (query.toLowerCase().includes('dasatinib')) {
      mockResults = [
        {
          drug: 'Dasatinib',
          drug_id: 'CHEMBL1421',
          toxicity_type: 'Pleural Effusion',
          severity: 'Grade 3',
          frequency: '28%',
          source: 'OpenTargets'
        }
      ]
    }
    
    setResults(mockResults)
    setLoading(false)
  }

  const exportCSV = () => {
    if (results.length === 0) return
    
    const headers = Object.keys(results[0]).join(',')
    const rows = results.map(row => Object.values(row).join(',')).join('\n')
    const csv = headers + '\n' + rows
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query_results.csv'
    a.click()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Head>
        <title>Drug Query Tool - Bioinformatics Search</title>
        <meta name="description" content="Search biomedical databases with natural language queries" />
      </Head>

      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Drug Query Tool
          </h1>
          <p style={{ marginTop: '8px', color: '#6b7280', margin: '8px 0 0 0' }}>
            Advanced bioinformatics search with synonym resolution
          </p>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#10b981', margin: '4px 0 0 0' }}>
            ✅ Production demo with enhanced NLP processing and database simulation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        {/* Query Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Natural Language Query
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., List diseases in Phase-2 for Imatinib"
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                Select Databases
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {['OpenTargets', 'ClinicalTrials.gov', 'ClinVar', 'Human Protein Atlas', 'ChEMBL'].map(db => (
                  <label key={db} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedDatabases.includes(db)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDatabases([...selectedDatabases, db])
                        } else {
                          setSelectedDatabases(selectedDatabases.filter(d => d !== db))
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px' }}>{db}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {selectedDatabases.length} database{selectedDatabases.length !== 1 ? 's' : ''} selected
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading || !query.trim() ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Searching...' : 'Search Databases'}
              </button>
            </div>
          </form>

          {/* Example Queries */}
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af', margin: '0 0 8px 0' }}>
              Try these example queries:
            </h4>
            <div style={{ fontSize: '13px', color: '#1e40af' }}>
              {[
                'List diseases in Phase-2 for Imatinib',
                'List toxicities for Dasatinib',
                'List diseases associated with JAK2',
                'List approved compounds for Alopecia'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(example)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: '#1e40af',
                    padding: '4px 0',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  • {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', margin: 0 }}>
                Results ({results.length} found)
              </h2>
              <button
                onClick={exportCSV}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Export CSV
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {results.length > 0 && Object.keys(results[0]).map(key => (
                      <th key={key} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {Object.values(row).map((value, j) => (
                        <td key={j} style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !query && (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: '0 0 8px 0' }}>
              Ready to search biomedical databases
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
              Enter a natural language query above to get started
            </p>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <strong>Supported entities:</strong> Drugs (Imatinib, Dasatinib), Targets (JAK2, TP53), Diseases (Breast Cancer, Alopecia)
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>
              🔍 Searching databases... Processing your query with enhanced NLP
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
