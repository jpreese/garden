/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import cls from "classnames"
import { css } from "emotion/macro"
import React, { Component, ChangeEvent } from "react"
import styled from "@emotion/styled/macro"
import { capitalize, uniq } from "lodash"
import * as d3 from "d3"
import dagreD3 from "dagre-d3"

import {
  FetchConfigResponse,
  FetchGraphResponse,
  WsMessage,
  nodeTaskTypes,
} from "../../api/types"
import Card from "../card"

import "./graph.scss"
import { colors, fontMedium } from "../../styles/variables"
import Spinner from "../spinner"
import CheckBox from "../checkbox"

interface Node {
  name: string
  label: string
  id: string
}

interface Edge {
  source: string
  target: string
  type: string
  since?: number
}

export interface Graph {
  nodes: Node[]
  edges: Edge[]
}

const MIN_CHART_WIDTH = 200
const MIN_CHART_HEIGHT = 200

function drawChart(graph: Graph, width: number, height: number) {
  // Create the input graph
  const g = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function() { return {} })

  // Here we"re setting nodeclass, which is used by our custom drawNodes function
  // below.
  for (const node of graph.nodes) {
    g.setNode(node.id, {
      label: node.label,
      class: "",
      id: node.id,
      labelType: "html",
    })
  }

  g.nodes().forEach(function(v) {
    const node = g.node(v)
    // Round the corners of the nodes
    node.rx = node.ry = 5
    // Add more padding
    node.paddingBottom = 20
    node.paddingTop = 20
    node.paddingLeft = 20
    node.paddingRight = 20
  })

  // Set up edges, no special attributes.
  for (const edge of graph.edges) {
    g.setEdge(edge.source, edge.target)
  }

  // Create the renderer
  const render = new dagreD3.render()

  // Clear previous content if any (for updating)
  d3.selectAll("#chart svg").remove()

  // Set width and height. Height gets updated once graph is rendered
  width = Math.max(width, MIN_CHART_WIDTH)
  height = Math.max(height, MIN_CHART_HEIGHT)

  const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)

  // Set up an SVG group so that we can translate the final graph.
  const svgGroup = svg.append("g")

  // Set up zoom support
  const zoom = d3.zoom().on("zoom", () => {
    svgGroup.attr("transform", d3.event.transform)
  })
  svg.call(zoom)

  // Run the renderer. This is what draws the final graph.
  // @ts-ignore
  render(svgGroup, g)

  const initialScale = 0.75 // TODO: Make a function of number or services

  // Re-set svg frame height after graph has been been drawn
  // const graphHeight = g.graph().height * initialScale + 40
  // svg.attr("height", Math.max(graphHeight, MIN_CHART_HEIGHT))

  // Center the graph
  const xCenterOffset = (parseInt(svg.attr("width"), 10) - g.graph().width * initialScale) / 2
  const yCenterOffset = (parseInt(svg.attr("height"), 10) - g.graph().height * initialScale) / 2
  const zoomTranslate = d3.zoomIdentity.translate(xCenterOffset, yCenterOffset).scale(initialScale)
  svg.call(zoom.transform, zoomTranslate)

}

interface Props {
  config: FetchConfigResponse
  graph: FetchGraphResponse
  message?: WsMessage
}

interface State {
  filters: { [key: string]: boolean }
  nodes: Node[]
  edges: Edge[]
}

// Renders as HTML
const makeLabel = (name: string, type: string, moduleName: string) => {
  if (type === "test") {
    type = `${type} (${name})`
    name = moduleName
  }
  return "<div class='label-wrap'><span class='name'>" +
    name + "</span><br /><span class='type'>" + type + "</span></div>"
}

const Span = styled.span`
  margin-left: 1rem;
`

const Status = styled.p`
  ${fontMedium}
  colors: grey;
`

const ProcessSpinner = styled(Spinner)`
  margin: 16px 0 0 20px;
`

class Chart extends Component<Props, State> {

  _nodes: Node[]
  _edges: Edge[]
  _chartRef: React.RefObject<any>

  state = {
    nodes: [],
    edges: [],
    filters: {},
  }

  constructor(props) {
    super(props)

    this._chartRef = React.createRef()
    this.onCheckboxChange = this.onCheckboxChange.bind(this)

    const taskTypes = uniq(this.props.graph.nodes.map(n => n.type))
    const filters = taskTypes.reduce((acc, type) => {
      acc[type] = false
      return acc
    }, {})
    this.state = {
      ...this.state,
      filters,
    }
  }

  componentDidMount() {
    this.drawChart()

    // Re-draw graph on **end** of window resize event (hence the timer)
    let resizeTimer: NodeJS.Timeout
    window.onresize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        this.drawChart()
      }, 250)
    }
  }

  componentWillUnmount() {
    window.onresize = () => { }
  }

  onCheckboxChange({ target }: ChangeEvent<HTMLInputElement>) {
    this.setState({
      filters: { ...this.state.filters, [target.name]: !target.checked },
    })
  }

  drawChart() {
    const graph = this.makeGraph()
    this._nodes = graph.nodes
    this._edges = graph.edges
    const width = this._chartRef.current.offsetWidth
    const height = this._chartRef.current.offsetHeight
    drawChart(graph, width, height)
  }

  makeGraph() {
    const { filters } = this.state
    const nodes: Node[] = this.props.graph.nodes
      .filter(n => !filters[n.type])
      .map(n => {
        return {
          id: n.key,
          name: n.name,
          label: makeLabel(n.name, n.type, n.moduleName),
        }
      })
    const edges: Edge[] = this.props.graph.relationships
      .filter(n => !filters[n.dependant.type] && !filters[n.dependency.type])
      .map(r => {
        const source = r.dependency
        const target = r.dependant
        return {
          source: source.key,
          target: target.key,
          type: source.type,
        }
      })
    return { edges, nodes }
  }

  componentDidUpdate(_prevProps, prevState: State) {
    const message = this.props.message
    if (message && message.type === "event") {
      this.updateNodeClass(message)
    }
    if (prevState.filters !== this.state.filters) {
      this.drawChart()
    }
  }

  clearClasses(el: HTMLElement) {
    for (const className of nodeTaskTypes) {
      el.classList.remove(className)
    }
  }

  // Update the node class instead of re-rendering the graph for perf reasons
  updateNodeClass(message: WsMessage) {
    for (const node of this._nodes) {
      if (message.payload.key && node.id === message.payload.key) {
        const nodeEl = document.getElementById(node.id)
        this.clearClasses(nodeEl)
        if (nodeTaskTypes.find(t => t === message.name)) {
          nodeEl.classList.add(message.name) // message.name is of type NodeTask
        }
      }
    }
  }

  render() {
    const { message } = this.props
    const taskTypes = uniq(this.props.graph.nodes.map(n => n.type))
    const chartHeightEstimate = `100vh - 15rem`

    let spinner = null
    let status = ""
    if (message && message.name !== "taskGraphComplete") {
      status = "Processing..."
      spinner = <ProcessSpinner background={colors.gardenWhite} fontSize="2px" />
    }

    return (
      <Card>
        <div className="mt-1">
          <div className={css`display: flex;`}>
            {taskTypes.map(type => (
              <div className="ml-1" key={type}>
                <CheckBox
                  label={capitalize(type)}
                  name={type}
                  checked={!this.state.filters[type]}
                  onChange={this.onCheckboxChange}
                />
              </div>
            ))}
          </div>
          <div className={css`
            height: calc(${chartHeightEstimate});
          `} ref={this._chartRef} id="chart">
          </div>
          <div className={cls(css`
            display: flex;
            justify-content: space-between;
          `, "ml-1 mr-1 pb-1")}>
            <div className={css`display: flex;`}>
              <Status>{status}</Status>
              {spinner}
            </div>
            <p>
              <Span><span className={css`color: ${colors.gardenGreen};`}>—  </span>Ready</Span>
              <Span><span className={css`color: ${colors.gardenPink};`}>--  </span>Pending</Span>
              <Span><span className={css`color: red;`}>—  </span>Error</Span>
            </p>
          </div>
        </div>
      </Card>
    )
  }

}

export default Chart
