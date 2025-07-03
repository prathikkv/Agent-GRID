/**
 * SynonymPrompt component - Modal for resolving ambiguous entity names
 * Helps users clarify which specific entity they meant when multiple options exist
 */

export default function SynonymPrompt({ options, onSelect, onClose }) {
  if (!options || options.length === 0) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Clarify Your Query
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              We found multiple possible matches for your query. Please select the most appropriate option:
            </p>
            
            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(option)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{option.original}</p>
                      {option.synonyms && option.synonyms.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Also known as: {option.synonyms.slice(0, 3).join(', ')}
                          {option.synonyms.length > 3 && '...'}
                        </p>
                      )}
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">Confidence: </span>
                        <div className="ml-1 flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(option.confidence || 0.5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            {Math.round((option.confidence || 0.5) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}