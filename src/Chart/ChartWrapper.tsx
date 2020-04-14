import React from 'react'

import GapMinder from './GapMinder'

import './ChartWrapper.scss'

// Wrapper: portal for mounting and styling any chart (switch statement will provide chart selection capability)
const ChartWrapper = () => {
  return (
    <div id="chart-wrapper">
      {/* Use a resizeobserver or another function to dynamically calculate these values */}
      <GapMinder height={600} width={1000} />
    </div>
  )
}

export default ChartWrapper
