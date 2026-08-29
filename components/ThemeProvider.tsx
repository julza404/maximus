'use client'

import { useEffect } from 'react'
import SunCalc from 'suncalc'

// Fallback: Sydney
const DEFAULT_LAT = -33.87
const DEFAULT_LNG = 151.21

function getTheme(lat: number, lng: number, now: Date): 'light' | 'dark' {
  const { sunrise, sunset } = SunCalc.getTimes(now, lat, lng)
  return now >= sunrise && now < sunset ? 'light' : 'dark'
}

function scheduleSwitch(lat: number, lng: number, apply: (t: 'light' | 'dark') => void) {
  const now = new Date()
  const { sunrise, sunset } = SunCalc.getTimes(now, lat, lng)

  const upcoming = [sunrise, sunset]
    .filter(t => t > now)
    .sort((a, b) => a.getTime() - b.getTime())

  let next: Date
  let nextTheme: 'light' | 'dark'

  if (upcoming.length === 0) {
    // Both passed today — next is tomorrow's sunrise
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    next = SunCalc.getTimes(tomorrow, lat, lng).sunrise
    nextTheme = 'light'
  } else {
    next = upcoming[0]
    nextTheme = next === sunrise ? 'light' : 'dark'
  }

  const delay = next.getTime() - now.getTime()
  setTimeout(() => {
    apply(nextTheme)
    scheduleSwitch(lat, lng, apply)
  }, delay)
}

export function ThemeProvider() {
  useEffect(() => {
    function apply(theme: 'light' | 'dark') {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }

    function init(lat: number, lng: number) {
      localStorage.setItem('maximus-lat', String(lat))
      localStorage.setItem('maximus-lng', String(lng))
      apply(getTheme(lat, lng, new Date()))
      scheduleSwitch(lat, lng, apply)
    }

    // Instant apply from stored location
    const lat = parseFloat(localStorage.getItem('maximus-lat') ?? 'NaN')
    const lng = parseFloat(localStorage.getItem('maximus-lng') ?? 'NaN')
    init(isNaN(lat) || isNaN(lng) ? DEFAULT_LAT : lat, isNaN(lat) || isNaN(lng) ? DEFAULT_LNG : lng)

    // Refine with real location if granted
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => init(coords.latitude, coords.longitude),
      () => {} // silently keep default/stored
    )
  }, [])

  return null
}
