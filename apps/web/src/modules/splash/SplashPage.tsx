import { createElement } from 'react'
import './SplashPage.css'

export function SplashPage() {
  return createElement(
    'main',
    { className: 'splash-page' },
    createElement(
      'div',
      { className: 'splash-shell' },

      createElement(
        'div',
        { className: 'splash-logo' },
        createElement(
          'svg',
          {
            width: 42,
            height: 42,
            viewBox: '0 0 32 32',
            fill: 'none',
            'aria-hidden': 'true',
          },
          createElement('circle', {
            cx: 16,
            cy: 6,
            r: 3.2,
            fill: '#0B0E14',
          }),
          createElement('circle', {
            cx: 6,
            cy: 24,
            r: 3.2,
            fill: '#3654FF',
          }),
          createElement('circle', {
            cx: 26,
            cy: 24,
            r: 3.2,
            fill: '#8B5CF6',
          }),
          createElement('path', {
            d: 'M16 9 L7 21.5 M16 9 L25 21.5 M8.5 24 H23.5',
            stroke: '#0B0E14',
            strokeWidth: 1.4,
            strokeOpacity: 0.35,
          })
        )
      ),

      createElement(
        'span',
        { className: 'splash-name' },
        'gru',
        createElement(
          'span',
          { className: 'splash-name-place' },
          'place'
        )
      ),

      createElement(
        'div',
        { className: 'splash-loading' },
        createElement(
          'div',
          {
            className: 'splash-spinner',
            'aria-hidden': 'true',
          }
        ),
        createElement(
          'span',
          null,
          'Preparando sua experiência...'
        )
      )
    )
  )
}
