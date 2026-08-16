import './ConsumerHome.css'

type ConsumerHomeProps = {
  shoppingId: string | null
}

export function ConsumerHome({
  shoppingId: _shoppingId,
}: ConsumerHomeProps) {

  return (
    <main className="consumer-home">

      <header className="consumer-home-header">

        <div className="consumer-home-brand">
          gru<span>place</span>
        </div>

        <button
          className="consumer-home-profile"
          type="button"
          aria-label="Perfil"
        >
          M
        </button>

      </header>

      <section className="consumer-home-shopping">

        <span className="consumer-home-label">
          SEU SHOPPING
        </span>

        <h1>
          Shopping Gruplace Demo
        </h1>

      </section>

      <section className="consumer-home-welcome">

        <span className="consumer-home-label">
          PARA VOCÊ
        </span>

        <h2>
          Descubra o que está acontecendo.
        </h2>

        <p>
          Lojas, novidades, ofertas e experiências
          escolhidas para você.
        </p>

      </section>

      <section className="consumer-home-feature">

        <div className="consumer-home-feature-content">

          <span className="consumer-home-feature-label">
            DESTAQUE
          </span>

          <h2>
            Descubra o seu shopping
            do seu jeito.
          </h2>

          <p>
            Explore lojas, novidades e experiências
            que combinam com você.
          </p>

          <button
            className="consumer-home-feature-button"
            type="button"
          >
            EXPLORAR
          </button>

        </div>

      </section>

      <section className="consumer-home-section">

        <div className="consumer-home-section-header">

          <h2>
            Seus interesses
          </h2>

          <button type="button">
            VER TODOS
          </button>

        </div>

        <div className="consumer-home-interest-list">

          <button type="button">
            Moda
          </button>

          <button type="button">
            Gastronomia
          </button>

          <button type="button">
            Tecnologia
          </button>

          <button type="button">
            Beleza
          </button>

        </div>

      </section>

      <section className="consumer-home-section">

        <div className="consumer-home-section-header">

          <h2>
            Novidades
          </h2>

          <button type="button">
            VER TODAS
          </button>

        </div>

        <div className="consumer-home-cards">

          <article className="consumer-home-card">

            <div className="consumer-home-card-image">
            </div>

            <div className="consumer-home-card-content">

              <span>
                NOVIDADE
              </span>

              <h3>
                Descubra as novidades
                das lojas.
              </h3>

              <p>
                Veja o que chegou ao seu shopping.
              </p>

            </div>

          </article>

          <article className="consumer-home-card">

            <div className="consumer-home-card-image second">
            </div>

            <div className="consumer-home-card-content">

              <span>
                EXPERIÊNCIA
              </span>

              <h3>
                Experiências para você.
              </h3>

              <p>
                Encontre eventos e atividades
                no shopping.
              </p>

            </div>

          </article>

        </div>

      </section>

      <section className="consumer-home-section">

        <div className="consumer-home-section-header">

          <h2>
            Ofertas
          </h2>

          <button type="button">
            VER TODAS
          </button>

        </div>

        <div className="consumer-home-offers">

          <article className="consumer-home-offer">

            <span>
              OFERTA
            </span>

            <h3>
              Ofertas das suas lojas favoritas.
            </h3>

            <p>
              Descubra oportunidades perto de você.
            </p>

          </article>

          <article className="consumer-home-offer">

            <span>
              OFERTA
            </span>

            <h3>
              Novas oportunidades no shopping.
            </h3>

            <p>
              Conteúdos selecionados para você.
            </p>

          </article>

        </div>

      </section>

      <nav className="consumer-home-navigation">

        <button
          className="active"
          type="button"
        >
          INÍCIO
        </button>

        <button type="button">
          EXPLORAR
        </button>

        <button type="button">
          FAVORITOS
        </button>

        <button type="button">
          PERFIL
        </button>

      </nav>

    </main>
  )
}
