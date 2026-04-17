// Mapbox constants
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
export const MAPBOX_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-v9' // Higher quality satellite
export const MAPBOX_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11'

// Ireland boundaries and center
export const IRELAND_CENTER = [-8.2, 53.4]
export const IRELAND_BOUNDS = [[-10.7, 51.3], [-5.9, 55.5]]
export const IRELAND_MAX_BOUNDS = [[-12, 50.8], [-4.5, 56.2]]

// Building type icons
export const TYPE_ICONS = {
  asylum: '🏥',
  industrial: '🏭',
  entertainment: '🎭',
  mansion: '🏰',
  hotel: '🏨',
  church: '⛪',
  default: '📍'
}

// Risk level colors
export const RISK_COLORS = {
  low: '#4ade80',
  medium: '#fb923c',
  high: '#f87171'
}

export const RISK_LABELS = {
  low: 'LOW RISK',
  medium: 'MED RISK',
  high: 'HIGH RISK'
}

// All Irish counties
export const IRELAND_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois',
  'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
  'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford',
  'Wicklow'
]
