import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'

import rawData from '../../Data/data.json'

type CountryData = {
  population: number;
  income: number;
  life_exp: number; // eslint-disable-line
  continent: string;
  country: string;
  dirty?: boolean;
  }

  interface ChartData {
  year: string;
  countries: CountryData[];
  }

  type Scale = {
    xScale: d3.ScaleLogarithmic<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    rScale: d3.ScalePower<number, number>;
    colorScale: d3.ScaleOrdinal<string, any>;
  }

/**
   * CHART POSITIONING CONSTANTS
   */
const margin = { top: 20, right: 30, bottom: 30, left: 40 }
const width = 1000 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

// This is basically where all the static info is generated (area, axes, titles, legend)
// + where the data is parsed and cleaned
// + where the timer is initiated

const Chart = () => {
  const d3Container: any = useRef()
  const [data, setData] = useState<ChartData[]>()
  const [index, setIndex] = useState<number>(0)
  const [scales, setScales] = useState<Scale>()

  useEffect(() => {
    let interval: any

    /**
     * DATA CLEANING & PREPPING
     */

    const flaggedData: ChartData[] = [...rawData as ChartData[]]
    let continents: string[] = [] as string[]
    let maxPop = 0
    let minPop = 0
    let maxIncome = 0
    let maxLifeExp = 0
    flaggedData.map((datum, index) => {
      return datum.countries.forEach((country, i) => {
      // list the different continents for ordinal categorisation by colour while you're at it
        continents = continents.includes(country.continent) ? continents : [...continents, country.continent]

        if (country.life_exp && country.income && country.population) {
          maxPop = country.population > maxPop ? country.population : maxPop
          minPop = country.population < minPop ? country.population : minPop
          maxIncome = country.income > maxIncome ? country.income : maxIncome
          maxLifeExp = country.life_exp > maxLifeExp ? country.life_exp : maxLifeExp
          flaggedData[index].countries[i].dirty = false
        } else {
          flaggedData[index].countries[i].dirty = true
        }
      })
    })

    /**
     * CREATING THE SCALE CONVERTERS
     */

    const xScale = d3.scaleLog()
      .base(10)
      .domain([100, maxIncome])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear().domain([0, maxLifeExp + 10]).range([height - margin.bottom, margin.top])

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
     * ADDING THE AXES
     */
    d3.select('#axes').append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickValues([400, 4000, 40000])
        .tickFormat(d3.format('$')))

    d3.select('#axes').append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))

    interval = d3.interval(() => { // eslint-disable-line
      setIndex(index => {
        if (index < flaggedData.length - 1) {
          return index + 1
        } else {
          return 0
        }
      })
    }, 200)

    setData(flaggedData)

    return () => interval.stop()
  }, [])

  return (
    <svg
      viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}
    >
      <g id='axes' transform={`translate(${margin.left}, ${margin.top})`} ref={d3Container}>
        {data?.length
          ? <>
            <text
              id="year"
              x={width - margin.right - margin.left}
              y={height - margin.top - margin.bottom}
              fill='white'
              stroke='black'
              fontSize={40}
              textAnchor='middle'
            >
              {data[index].year}
            </text>
            {scales && data[index].countries.map((country, index) => {
              return (
                <circle
                  key={`${index}-${country.country}`}
                  cy={!country.dirty ? scales.yScale(country.life_exp) : undefined}
                  cx={!country.dirty ? scales.xScale(country.income) : undefined}
                  r={!country.dirty ? scales.rScale(country.population) : undefined}
                  opacity={0.6}
                  fill={`${scales.colorScale(country.continent)}`}
                />
              )
            })}
          </>
          : null }
      </g>
    </svg>
  )
}

export default Chart
