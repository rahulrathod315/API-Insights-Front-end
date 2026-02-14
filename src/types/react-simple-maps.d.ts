declare module 'react-simple-maps' {
  import type { ComponentType, CSSProperties, ReactNode } from 'react'

  interface ProjectionConfig {
    scale?: number
    center?: [number, number]
    rotate?: [number, number, number]
  }

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: ProjectionConfig
    width?: number
    height?: number
    className?: string
    style?: CSSProperties
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    children?: ReactNode
  }

  interface GeographyStyleObject {
    outline?: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    opacity?: number
    cursor?: string
    transition?: string
  }

  interface GeographyProps {
    geography: GeoObject
    key?: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: GeographyStyleObject
      hover?: GeographyStyleObject
      pressed?: GeographyStyleObject
    }
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void
    className?: string
  }

  interface GeoObject {
    rsmKey: string
    id: string
    type: string
    properties: Record<string, unknown>
    geometry: unknown
  }

  interface GeographiesChildrenArgs {
    geographies: GeoObject[]
  }

  interface GeographiesProps {
    geography: string | object
    children: (args: GeographiesChildrenArgs) => ReactNode
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
}
