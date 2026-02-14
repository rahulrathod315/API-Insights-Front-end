import { useState, useMemo, useCallback } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { GeoCountry } from '../types'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ISO 3166-1 numeric to alpha-2 mapping
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '020': 'AD', '024': 'AO',
  '028': 'AG', '032': 'AR', '036': 'AU', '040': 'AT', '031': 'AZ',
  '044': 'BS', '048': 'BH', '050': 'BD', '052': 'BB', '112': 'BY',
  '056': 'BE', '084': 'BZ', '204': 'BJ', '064': 'BT', '068': 'BO',
  '070': 'BA', '072': 'BW', '076': 'BR', '096': 'BN', '100': 'BG',
  '854': 'BF', '108': 'BI', '132': 'CV', '116': 'KH', '120': 'CM',
  '124': 'CA', '140': 'CF', '148': 'TD', '152': 'CL', '156': 'CN',
  '170': 'CO', '174': 'KM', '178': 'CG', '180': 'CD', '188': 'CR',
  '384': 'CI', '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ',
  '208': 'DK', '262': 'DJ', '212': 'DM', '214': 'DO', '218': 'EC',
  '818': 'EG', '222': 'SV', '226': 'GQ', '232': 'ER', '233': 'EE',
  '748': 'SZ', '231': 'ET', '242': 'FJ', '246': 'FI', '250': 'FR',
  '266': 'GA', '270': 'GM', '268': 'GE', '276': 'DE', '288': 'GH',
  '300': 'GR', '308': 'GD', '320': 'GT', '324': 'GN', '328': 'GY',
  '332': 'HT', '340': 'HN', '348': 'HU', '352': 'IS', '356': 'IN',
  '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL',
  '380': 'IT', '388': 'JM', '392': 'JP', '400': 'JO', '398': 'KZ',
  '404': 'KE', '296': 'KI', '408': 'KP', '410': 'KR', '414': 'KW',
  '417': 'KG', '418': 'LA', '428': 'LV', '422': 'LB', '426': 'LS',
  '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU',
  '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML',
  '470': 'MT', '584': 'MH', '478': 'MR', '480': 'MU', '484': 'MX',
  '583': 'FM', '498': 'MD', '492': 'MC', '496': 'MN', '499': 'ME',
  '504': 'MA', '508': 'MZ', '104': 'MM', '516': 'NA', '520': 'NR',
  '524': 'NP', '528': 'NL', '554': 'NZ', '558': 'NI', '562': 'NE',
  '566': 'NG', '807': 'MK', '578': 'NO', '512': 'OM', '586': 'PK',
  '585': 'PW', '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE',
  '608': 'PH', '616': 'PL', '620': 'PT', '634': 'QA', '642': 'RO',
  '643': 'RU', '646': 'RW', '659': 'KN', '662': 'LC', '670': 'VC',
  '882': 'WS', '674': 'SM', '678': 'ST', '682': 'SA', '686': 'SN',
  '688': 'RS', '690': 'SC', '694': 'SL', '702': 'SG', '703': 'SK',
  '705': 'SI', '090': 'SB', '706': 'SO', '710': 'ZA', '724': 'ES',
  '144': 'LK', '736': 'SD', '740': 'SR', '752': 'SE', '756': 'CH',
  '760': 'SY', '762': 'TJ', '834': 'TZ', '764': 'TH', '626': 'TL',
  '768': 'TG', '776': 'TO', '780': 'TT', '788': 'TN', '792': 'TR',
  '795': 'TM', '798': 'TV', '800': 'UG', '804': 'UA', '784': 'AE',
  '826': 'GB', '840': 'US', '858': 'UY', '860': 'UZ', '548': 'VU',
  '862': 'VE', '704': 'VN', '887': 'YE', '894': 'ZM', '716': 'ZW',
  '-99': 'XK', '275': 'PS', '728': 'SS',
}

interface GeoWorldMapProps {
  countries: GeoCountry[]
  isLoading?: boolean
  onCountryClick?: (countryCode: string) => void
}

export function GeoWorldMap({ countries, isLoading, onCountryClick }: GeoWorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string
    requests: number
    errorRate: number
    x: number
    y: number
  } | null>(null)

  const countryMap = useMemo(() => {
    const map = new Map<string, GeoCountry>()
    for (const c of countries) {
      map.set(c.country_code, c)
    }
    return map
  }, [countries])

  const maxRequests = useMemo(() => {
    if (countries.length === 0) return 1
    return Math.max(...countries.map((c) => c.request_count))
  }, [countries])

  const getFill = useCallback((countryCode: string): string => {
    const data = countryMap.get(countryCode)
    if (!data) return 'var(--muted)'
    const ratio = data.request_count / maxRequests
    // 5-step scale using theme primary at varying opacities
    if (ratio > 0.8) return 'var(--primary)'
    if (ratio > 0.6) return 'color-mix(in oklch, var(--primary) 80%, var(--muted))'
    if (ratio > 0.35) return 'color-mix(in oklch, var(--primary) 55%, var(--muted))'
    if (ratio > 0.15) return 'color-mix(in oklch, var(--primary) 35%, var(--muted))'
    return 'color-mix(in oklch, var(--primary) 20%, var(--muted))'
  }, [countryMap, maxRequests])

  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Request Distribution</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="text-sm font-semibold">{tooltip.name}</p>
            <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              <p>Requests: <span className="font-medium text-foreground">{formatNumber(tooltip.requests)}</span></p>
              <p>Error rate: <span className="font-medium text-foreground">{formatPercent(tooltip.errorRate)}</span></p>
            </div>
          </div>
        )}

        <ComposableMap
          projectionConfig={{ scale: 147 }}
          className="w-full"
          style={{ maxHeight: 420 }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const alpha2 = NUMERIC_TO_ALPHA2[geo.id] ?? ''
                  const data = countryMap.get(alpha2)
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFill(alpha2)}
                      stroke="var(--border)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', transition: 'fill 150ms ease, stroke-width 150ms ease' },
                        hover: {
                          outline: 'none',
                          fill: data ? 'var(--primary)' : 'var(--accent)',
                          strokeWidth: data ? 1.5 : 0.5,
                          stroke: data ? 'var(--foreground)' : 'var(--border)',
                          cursor: data ? 'pointer' : 'default',
                        },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(evt) => {
                        const name = geo.properties.name as string
                        const svgEl = (evt.target as SVGElement).closest('svg')
                        const rect = svgEl?.getBoundingClientRect()
                        if (rect) {
                          setTooltip({
                            name,
                            requests: data?.request_count ?? 0,
                            errorRate: data?.error_rate ?? 0,
                            x: Math.min(evt.clientX - rect.left + 12, rect.width - 160),
                            y: evt.clientY - rect.top - 50,
                          })
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => {
                        if (data && onCountryClick) {
                          onCountryClick(alpha2)
                        }
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
          <span>Low</span>
          {[0.2, 0.35, 0.55, 0.8, 1].map((opacity) => (
            <div
              key={opacity}
              className="h-2.5 w-5 rounded-sm"
              style={{
                backgroundColor: 'var(--primary)',
                opacity,
              }}
            />
          ))}
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  )
}
