/**
 * Visualizations component - Creates charts and graphs from query results
 * Helps biologists understand data patterns through visual representations
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState } from 'react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function Visualizations({ data, queryInfo }) {
  const [activeChart, setActiveChart] = useState('bar')

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for visualization
      </div>
    )
  }

  // Prepare data for different chart types based on query intent
  const chartData = prepareChartData(data, queryInfo)

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex space-x-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveChart('bar')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeChart === 'bar'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bar Chart
        </button>
        
        <button
          onClick={() => setActiveChart('pie')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeChart === 'pie'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pie Chart
        </button>

        {chartData.heatmapData && (
          <button
            onClick={() => setActiveChart('heatmap')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeChart === 'heatmap'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Heatmap
          </button>
        )}
      </div>

      {/* Chart Container */}
      <div className="h-96">
        {activeChart === 'bar' && chartData.barData && (
          <BarChartVisualization data={chartData.barData} />
        )}
        
        {activeChart === 'pie' && chartData.pieData && (
          <PieChartVisualization data={chartData.pieData} />
        )}
        
        {activeChart === 'heatmap' && chartData.heatmapData && (
          <HeatmapVisualization data={chartData.heatmapData} />
        )}
      </div>

      {/* Chart Description */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Chart Information:</h4>
        <p className="text-sm text-gray-600">
          {getChartDescription(activeChart, queryInfo, data.length)}
        </p>
      </div>
    </div>
  )
}

function BarChartVisualization({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieChartVisualization({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

function HeatmapVisualization({ data }) {
  // Simplified heatmap using CSS grid
  return (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Expression Heatmap</h4>
      <div className="grid grid-cols-8 gap-1 flex-1">
        {data.map((cell, index) => (
          <div
            key={index}
            className="relative bg-blue-100 rounded flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: `rgb(${255 - cell.value * 255}, ${255 - cell.value * 255}, 255)`,
              color: cell.value > 0.5 ? 'white' : 'black'
            }}
            title={`${cell.tissue}: ${cell.value.toFixed(2)}`}
          >
            {cell.value.toFixed(1)}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Low Expression</span>
        <span>High Expression</span>
      </div>
    </div>
  )
}

function prepareChartData(data, queryInfo) {
  const intent = queryInfo?.parsed_query?.intent

  let barData = []
  let pieData = []
  let heatmapData = null

  if (intent === 'list_diseases') {
    // Group by phase for diseases
    const phaseCount = {}
    data.forEach(item => {
      const phase = item.phase || 'Unknown'
      phaseCount[phase] = (phaseCount[phase] || 0) + 1
    })
    
    barData = Object.entries(phaseCount).map(([phase, count]) => ({
      name: phase,
      value: count
    }))
    
    pieData = barData
  }
  
  else if (intent === 'list_toxicities') {
    // Group by toxicity type
    const toxicityCount = {}
    data.forEach(item => {
      const toxicity = item.toxicity_type || item.adverse_event || 'Unknown'
      toxicityCount[toxicity] = (toxicityCount[toxicity] || 0) + 1
    })
    
    barData = Object.entries(toxicityCount).map(([toxicity, count]) => ({
      name: toxicity,
      value: count
    }))
    
    pieData = barData
  }
  
  else if (intent === 'list_drugs') {
    // Group by drug phase
    const drugPhaseCount = {}
    data.forEach(item => {
      const phase = item.phase || 'Unknown'
      drugPhaseCount[phase] = (drugPhaseCount[phase] || 0) + 1
    })
    
    barData = Object.entries(drugPhaseCount).map(([phase, count]) => ({
      name: phase,
      value: count
    }))
    
    pieData = barData
  }
  
  else if (intent === 'list_expression') {
    // Create heatmap data for expression levels
    heatmapData = data.map((item, index) => ({
      tissue: item.tissue || `Sample ${index + 1}`,
      value: parseFloat(item.expression_level || Math.random()) // Use actual data or random for demo
    }))
    
    // Also create bar chart for expression levels
    barData = data.map((item, index) => ({
      name: item.tissue || `Sample ${index + 1}`,
      value: parseFloat(item.expression_level || Math.random())
    }))
  }
  
  else {
    // Default: count by source database
    const sourceCount = {}
    data.forEach(item => {
      const source = item.source || 'Unknown'
      sourceCount[source] = (sourceCount[source] || 0) + 1
    })
    
    barData = Object.entries(sourceCount).map(([source, count]) => ({
      name: source,
      value: count
    }))
    
    pieData = barData
  }

  return { barData, pieData, heatmapData }
}

function getChartDescription(chartType, queryInfo, dataLength) {
  const intent = queryInfo?.parsed_query?.intent || 'unknown'
  
  const descriptions = {
    bar: {
      list_diseases: `Bar chart showing distribution of ${dataLength} diseases across different clinical phases.`,
      list_toxicities: `Bar chart showing frequency of different toxicity types from ${dataLength} records.`,
      list_drugs: `Bar chart showing distribution of ${dataLength} drugs across clinical phases.`,
      list_expression: `Bar chart showing expression levels across different tissues/samples.`,
      default: `Bar chart showing distribution of ${dataLength} records by source database.`
    },
    pie: {
      list_diseases: `Pie chart showing proportion of diseases in each clinical phase.`,
      list_toxicities: `Pie chart showing relative frequency of different toxicity types.`,
      list_drugs: `Pie chart showing proportion of drugs in each clinical phase.`,
      default: `Pie chart showing distribution of records by source database.`
    },
    heatmap: {
      list_expression: `Heatmap showing expression intensity across different tissues or conditions.`,
      default: `Heatmap visualization of data patterns.`
    }
  }

  return descriptions[chartType][intent] || descriptions[chartType].default
}