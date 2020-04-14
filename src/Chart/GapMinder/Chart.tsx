import React, { useEffect, useState, useRef, MutableRefObject } from 'react'
import * as d3 from 'd3'

import { Scale, ChartConstants, CountryData } from './Canvas'

type Props = {
  data: CountryData[][];
  scales: Scale;
  chartConstants: ChartConstants;
}

const Chart = ({ data, scales, chartConstants }: Props) => {
  const [index, setIndex] = useState<number>(0)
  const chartRef: MutableRefObject<SVGGElement | null> = useRef(null)

  const { canvas: { width, height }, margins } = chartConstants

  useEffect(() => {
    const intervalFn = d3.interval(() => { // eslint-disable-line
      setIndex(index => {
        if (index < data.length - 1) {
          return index + 1
        } else {
          return 0
        }
      })
    }, 500)

    return () => intervalFn.stop()
  }, [])

  useEffect(() => {
    const circles = d3.select(chartRef.current)

    circles.selectAll('circle').data(data[index], (d: any) => d.country).join(
      enter => (
        enter.append('circle')
          .attr('cy', height)
          .attr('opacity', 0)
          .attr('cx', d => scales.xScale(d.income))
          .attr('r', 0)
          .attr('fill', d => scales.colorScale(d.continent))
          .call(enter => (
            enter.transition().duration(500)
              .attr('opacity', 0.6)
              .attr('r', d => scales.rScale(d.population))
              .attr('cy', d => scales.yScale(d.life_exp))
          ))
      ),
      update => (
        update
          .call(update => (
            update.transition().duration(500)
              .attr('r', d => scales.rScale(d.population))
              .attr('cy', d => scales.yScale(d.life_exp))
              .attr('cx', d => scales.xScale(d.income))
          ))
      )
      ,
      exit => (
        exit
          .call(exit => (
            exit.transition().duration(500)
              .attr('r', 0)
              .remove()
          )
          ))
    )
  }, [index, data])

  return (
    <g ref={chartRef}>
      <text
        id="year"
        x={width - margins.right - 5 * margins.left}
        y={height - margins.top - margins.bottom}
        fill='white'
        stroke='black'
        fontSize={40}
        textAnchor='middle'
      >
        {1800 + index}
      </text>
    </g>
  )
}

export default Chart
