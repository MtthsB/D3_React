import React, { useEffect, useState } from 'react'
import * as d3 from 'd3' // we need the global module in order for transitions to work

import rawData from '../../Data/data.json'
import Chart from './Chart'

import './Canvas.scss'
import Legend from './Legend'

export type CountryData = {
  population: number;
  income: number;
  life_exp: number; // eslint-disable-line
  continent: string;
  country: string;
  dirty?: boolean;
  }

export interface ChartData {
  year: string;
  countries: CountryData[];
  }

export type Scale = {
    xScale: d3.ScaleLogarithmic<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    rScale: d3.ScalePower<number, number>;
    colorScale: d3.ScaleOrdinal<string, any>;
  }

type CanvasDimensions = {
  width: number;
  height: number;
}
export type ChartConstants = {
  margins: Record<string, number>;
  canvas: CanvasDimensions;
}

// height and width should reflect the (dynamic) dimensions of the wrapper
type Props = {
  width: number;
  height: number;
}

const Canvas = (props: Props) => {
  const [data, setData] = useState<CountryData[][]>()
  const [scales, setScales] = useState<Scale>()
  const [continents, setContinents] = useState<string[]>()

  /**
   * CHART POSITIONING CONSTANTS
   */
  const chartMargins = { top: 20, right: 30, bottom: 30, left: 40 }
  const chartConstants: ChartConstants = {
    margins: chartMargins,
    canvas: {
      width: props.width - chartMargins.left - chartMargins.right,
      height: props.height - chartMargins.top - chartMargins.bottom
    }
  }

  useEffect(() => {
    /**
     * DATA CLEANING & PREPPING
     */
    const chartData: ChartData[] = [...rawData as ChartData[]]
    let continents: string[] = [] as string[]
    let maxPop = 0
    let minPop = 0
    let maxIncome = 0
    let maxLifeExp = 0

    const flaggedData = chartData.map(year => {
      return year.countries.filter(country => {
        if (country.life_exp && country.income && country.population) {
          continents = continents.includes(country.continent) ? continents : [...continents, country.continent]
          maxPop = country.population > maxPop ? country.population : maxPop
          minPop = country.population < minPop ? country.population : minPop
          maxIncome = country.income > maxIncome ? country.income : maxIncome
          maxLifeExp = country.life_exp > maxLifeExp ? country.life_exp : maxLifeExp
        }
        return (country.income && country.life_exp & country.population)
      })
    })

    /**
     * CREATING THE SCALE CONVERTERS -- these remain static across the changing data so they can be defined here
     */
    const xScale = d3.scaleLog()
      .base(10)
      .domain([100, maxIncome])
      .range([chartConstants.margins.left, chartConstants.canvas.width - chartConstants.margins.right])

    const yScale = d3.scaleLinear().domain([0, maxLifeExp + 10]).range([chartConstants.canvas.height - chartConstants.margins.bottom, chartConstants.margins.top])

    const rScale = d3.scalePow().domain([minPop, maxPop]).exponent(0.3).range([5, 50])

    const colorScale = d3.scaleOrdinal()
      .domain(continents)
      .range(d3.schemeBrBG[continents.length])

    setScales({
      xScale,
      yScale,
      rScale,
      colorScale
    })

    /**
     * ADDING THE AXES - no use for refs as these don't update
     */
    d3.select('#canvas').append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${chartConstants.canvas.height - chartConstants.margins.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickValues([400, 4000, 40000])
        .tickFormat(d3.format('$')))

    d3.select('#canvas').append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${chartConstants.margins.left}, 0)`)
      .call(d3.axisLeft(yScale))

    setData(flaggedData)
    setContinents(continents)
  }, [])

  const { canvas: { width, height }, margins } = chartConstants
  return (
    <div
      id="chart-area"
      style={{ height: `${height + margins.top + margins.bottom}px`, width: `${width + margins.left + margins.right}px` }}>

      <svg
        viewBox={`0 0 ${width + margins.left + margins.right} ${height + margins.top + margins.bottom}`}
      >
        <g
          id='canvas'
          transform={`translate(${margins.left}, ${margins.top})`} />

        {data?.length && scales && continents
          ? <>
            <Chart
              scales={scales}
              data={data}
              chartConstants={chartConstants}
            />
            {/* foreignObject to wrap html namespace elements in an svg namespace */}
            <foreignObject
              id="legend"
              transform={`translate(${width - 5 * margins.right} ${height - margins.top - 8 * margins.bottom})`}
              height='1'
              width='1'
            >
              <Legend labels={continents} scale={scales?.colorScale}/>
            </foreignObject>
          </>
          : null }

      </svg>
    </div>
  )
}

export default Canvas
