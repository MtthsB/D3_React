import React from 'react'

import GapMinder from './GapMinder'

import './ChartWrapper.css'

// Wrapper: portal for mounting and styling any chart (switch statement will provide selection capability)
const ChartWrapper = () => {
  return (
    <div id="chart-area">
      <GapMinder />
    </div>
  )
}

export default ChartWrapper
