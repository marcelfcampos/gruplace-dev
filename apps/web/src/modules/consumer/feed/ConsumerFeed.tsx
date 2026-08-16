import './ConsumerFeed.css'

type ConsumerFeedProps = {
  shoppingId: string | null
}

export function ConsumerFeed({
  shoppingId,
}: ConsumerFeedProps) {
  console.log('Shopping selecionado:', shoppingId)

  return (
    <main className="consumer-feed">

      <header className="consumer-feed-header">
        <div>
          <span className="consumer-feed-brand">
            gruplace
          </span>

          <p className="consumer-feed-shopping">
            Shopping Gruplace Demo
          </p>
        </div>

        <div className="consumer-feed-header-actions">

          <button
            className="consumer-feed-currency"
            type="button"
            aria-label="Conversor de moedas"
          >
            💱 BRL
          </button>

          <button
            className="consumer-feed-profile"
            type="button"
            aria-label="Perfil"
          >
            M
          </button>

        </div>
      </header>

      <section className="consumer-feed-intro">

        <span className="consumer-feed-label">
          PARA VOCÊ
        </span>

        <h1>
          Descubra o que está acontecendo.
        </h1>

        <p>
          Lojas, novidades, ofertas e experiências
          escolhidas para você.
        </p>

      </section>

      <nav
        className="consumer-feed-filters"
        aria-label="Filtros do feed"
      >

        <button
          className="active"
          type="button"
        >
          Todos
        </button>

        <button type="button">
          Ofertas
        </button>

        <button type="button">
          Novidades
        </button>

        <button type="button">
          Eventos
        </button>

        <button type="button">
          Cupons
        </button>

        <button type="button">
          Lançamentos
        </button>

      </nav>

      <section className="consumer-feed-tools">

        <button
          className="consumer-feed-tool"
          type="button"
        >

          <span className="consumer-feed-tool-icon">
            MAPA
          </span>

          <span className="consumer-feed-tool-content">
            <strong>
              Explorar o shopping
            </strong>

            <small>
              Encontre lojas, restaurantes e serviços.
            </small>
          </span>

          <span className="consumer-feed-tool-arrow">
            →
          </span>

        </button>

      </section>

      <section className="consumer-feed-map">

        <div className="consumer-feed-map-header">

          <div>

            <span className="consumer-feed-label">
              MAPA DO SHOPPING
            </span>

            <h2>
              Explore o shopping.
            </h2>

            <p>
              Encontre lojas, restaurantes, serviços
              e outros pontos de interesse.
            </p>

          </div>

          <button
            type="button"
            className="consumer-feed-map-button"
          >
            ABRIR MAPA
          </button>

        </div>

        <div className="consumer-feed-map-preview">

          <div className="consumer-feed-map-floor">
            PISO 1
          </div>

          <img
            alt="Mapa do Piso 1 do shopping"
            className="consumer-feed-map-svg"
            src="/maps/mapa-piso-1-planta.svg"
          />

        </div>

      </section>

      







      <section className="consumer-feed-content">

        <article className="card" id="postCard">

          <div className="card__header">
            <span className="avatar" aria-hidden="true">
              LG
            </span>

            <div className="header__info">
              <div className="header__name">
                Loja Gruplace
              </div>

              <div className="header__meta">
                Shopping Gruplace Demo · há 5 min
              </div>
            </div>

            <span className="badge">
              Oferta
            </span>
          </div>

          <div className="card__image">
            <span className="image__label">
              imagem do produto
            </span>
          </div>

          <div className="card__content">

            <h2 className="content__title">
              Até 40% OFF em produtos selecionados.
            </h2>

            <p className="content__desc">
              Encontre novidades, modelos exclusivos e ofertas especiais
              na Loja Gruplace. Aproveite enquanto durar.
            </p>

            <button
              className="cta"
              type="button"
            >
              Ver ofertas
            </button>

          </div>

          <div className="card__actions">

            <button
              className="action"
              type="button"
              aria-label="Seguir Loja Gruplace"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l1.5-5h15L21 9" />
                <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
                <path d="M9 20v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
                <path d="M3 9h18" />
              </svg>

              <span>
                Seguir
              </span>
            </button>

            <button
              className="action"
              type="button"
              aria-label="Curtir publicação"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 
0-7.8z" />
              </svg>

              <span>
                Curtir
              </span>
            </button>

            <button
              className="action"
              type="button"
              aria-label="Compartilhar publicação"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M16 6l-4-4-4 4" />
                <path d="M12 2v13" />
              </svg>

              <span>
                Compartilhar
              </span>
            </button>

            <button
              className="action is-open"
              type="button"
              aria-label="Abrir publicação"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>

              <span>
                Abrir
              </span>
            </button>

          </div>

        </article>

      </section>



    </main>
  )
}
