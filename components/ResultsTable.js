/**
 * ResultsTable component - Displays search results in a sortable, filterable table
 * Includes CSV export functionality for biologists to download data
 */

import { useState, useMemo } from 'react'
import { useTable, useSortBy, useGlobalFilter } from 'react-table'

// CSV export function using PapaParse
const exportToCSV = (data, filename = 'query_results.csv') => {
  const Papa = require('papaparse')
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Global filter component for search
function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="search" className="text-sm font-medium text-gray-700">
        Search:
      </label>
      <input
        id="search"
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Filter results..."
        className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
  )
}

export default function ResultsTable({ data }) {
  const [globalFilter, setGlobalFilter] = useState('')

  // Dynamic column generation based on data structure
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []

    // Get all unique keys from the data
    const allKeys = new Set()
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key))
    })

    // Create columns with proper formatting
    return Array.from(allKeys).map(key => ({
      Header: formatColumnHeader(key),
      accessor: key,
      Cell: ({ value }) => formatCellValue(value, key),
      sortType: getSortType(key)
    }))
  }, [data])

  // Format column headers for better readability
  function formatColumnHeader(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  // Format cell values based on column type
  function formatCellValue(value, key) {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>
    }

    if (typeof value === 'number') {
      if (key.includes('score') || key.includes('frequency')) {
        return <span className="font-mono">{value.toFixed(3)}</span>
      }
      return <span className="font-mono">{value}</span>
    }

    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Link
        </a>
      )
    }

    if (key.includes('phase')) {
      const phaseColors = {
        'approved': 'bg-green-100 text-green-800',
        '3': 'bg-blue-100 text-blue-800',
        '2': 'bg-yellow-100 text-yellow-800',
        '1': 'bg-orange-100 text-orange-800',
        'preclinical': 'bg-gray-100 text-gray-800'
      }
      const colorClass = phaseColors[value] || 'bg-gray-100 text-gray-800'
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {value}
        </span>
      )
    }

    if (key.includes('evidence_score') || key.includes('score')) {
      const score = parseFloat(value)
      const scoreColor = score > 0.8 ? 'text-green-600' : score > 0.5 ? 'text-yellow-600' : 'text-red-600'
      return <span className={`font-mono ${scoreColor}`}>{score.toFixed(3)}</span>
    }

    return <span className="text-gray-900">{value}</span>
  }

  // Determine sort type based on column name
  function getSortType(key) {
    if (key.includes('score') || key.includes('frequency') || key.includes('phase')) {
      return 'basic'
    }
    return 'alphanumeric'
  }

  // Initialize table instance
  const tableInstance = useTable(
    {
      columns,
      data: data || [],
      globalFilter,
      initialState: {
        sortBy: [
          {
            id: columns.find(col => col.accessor.includes('score'))?.accessor || columns[0]?.accessor,
            desc: true
          }
        ]
      }
    },
    useGlobalFilter,
    useSortBy
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter: setTableGlobalFilter
  } = tableInstance

  // Update global filter
  useMemo(() => {
    setTableGlobalFilter(globalFilter)
  }, [globalFilter, setTableGlobalFilter])

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to display
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      {/* Table Controls */}
      <div className="flex justify-between items-center">
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-700">
            {rows.length} result{rows.length !== 1 ? 's' : ''}
          </span>
          
          <button
            onClick={() => exportToCSV(data)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={column.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.render('Header')}</span>
                        <span className="text-gray-400">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            )
                          ) : (
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {rows.map((row, index) => {
                prepareRow(row)
                return (
                  <tr {...row.getRowProps()} key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        key={cell.column.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}