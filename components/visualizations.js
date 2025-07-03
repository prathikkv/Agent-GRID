import { useMemo } from 'react'

export default function Visualizations({ data, queryInfo }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    // Simple bar chart data preparation
    const phaseCount = {}
    data.forEach(item => {
      const phase = item.phase || 'Unknown'
      phaseCount[phase] = (phaseCount[phase] || 0) + 1
    })

    return Object.entries(phaseCount).map(([phase, count]) => ({
      phase,
      count
    }))
  }, [data])

  if (!chartData) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for visualization
      </div>
    )
  }

  const maxCount = Math.max(...chartData.map(d => d.count))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Distribution by Phase
        </h3>
        
        <div className="space-y-3">
          {chartData.map(({ phase, count }) => (
            <div key={phase} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600 text-right">
                {phase}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Chart Information:</h4>
        <p className="text-sm text-gray-600">
          This bar chart shows the distribution of {data.length} results across different phases or categories.
        </p>
      </div>
    </div>
  )
}
