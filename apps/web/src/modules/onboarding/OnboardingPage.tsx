import { createElement } from 'react'
import './OnboardingPage.css'

export function OnboardingPage({
  onStart,
}: {
  onStart: () => void
}) {
  return createElement(
    'main',
    { className: 'onboarding-page' },

    createElement(
      'div',
      { className: 'onboarding-content' },

      createElement(
        'div',
        { className: 'onboarding-brand' },
        'gru',
        createElement(
          'span',
          { className: 'onboarding-brand-place' },
          'place'
        )
      ),

      createElement(
        'h1',
        null,
        'Descubra o shopping do seu jeito.'
      ),

      createElement(
        'p',
        null,
        'Encontre lojas, novidades, ofertas e experiências que combinam com você.'
      ),

      createElement(
        'div',
        {
          className: 'onboarding-visual',
          'aria-hidden': 'true',
        },

        createElement(
          'div',
          { className: 'visual-card visual-card-back' }
        ),

        createElement(
          'div',
          { className: 'visual-card visual-card-main' },

      createElement(
  'div',
  { className: 'visual-card-message' },
  createElement('span', null, 'Seu shopping.'),
  createElement('span', null, 'Do seu jeito.')
),

          createElement(
            'div',
            { className: 'visual-store-row' },
            createElement('span', {
              className: 'visual-store-dot',
            }),
            createElement('span', {
              className: 'visual-store-line',
            }),
            createElement('span', {
              className: 'visual-store-dot violet',
            })
          ),

          createElement(
            'div',
            { className: 'visual-store-row short' },
            createElement('span', {
              className: 'visual-store-dot blue',
            }),
            createElement('span', {
              className: 'visual-store-line',
            })
          )
        ),

        createElement(
          'div',
          {
            className: 'visual-orb visual-orb-blue',
          }
        ),

        createElement(
          'div',
          {
            className: 'visual-orb visual-orb-violet',
          }
        )
      ),

     createElement(
        'button',
        {
          className: 'onboarding-button',
          type: 'button',
          onClick: onStart,
        },
         'COMEÇAR'
      ),


      createElement(
        'div',
        {
          className: 'onboarding-dots',
          'aria-hidden': 'true',
        },
        createElement('span', {
          className: 'onboarding-dot onboarding-dot-active',
        }),
        createElement('span', {
          className: 'onboarding-dot',
        }),
        createElement('span', {
          className: 'onboarding-dot',
        })
      )
    )
  )
}
