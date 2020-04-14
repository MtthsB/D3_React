import React from 'react'
import { ScaleOrdinal } from 'd3'

type Props = {
  labels: string[];
  scale: ScaleOrdinal<string, any>;
}

const Legend = ({ labels, scale }: Props) => {
  return (
    <ul>
      {labels.map((label, index) => {
        return (
          <li className="row" key={index}>
            <div style={{ backgroundColor: `${scale(label)}` }} />
            <p>{label}</p>
          </li>
        )
      })}
    </ul>
  )
}

export default Legend
