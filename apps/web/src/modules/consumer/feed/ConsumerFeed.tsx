import { useState } from 'react'
import './ConsumerFeed.css'

type ConsumerFeedProps = {
  shoppingId: string | null
}

export function ConsumerFeed({
  shoppingId,
}: ConsumerFeedProps) {
  console.log('Shopping selecionado:', shoppingId)

  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false)

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

        {isPostDetailOpen ? (
          <div className="post-detail">

            <header className="post-detail-header">

              <button
                className="post-detail-back"
                type="button"
                onClick={() => setIsPostDetailOpen(false)}
              >
                ← Voltar
              </button>

              <span className="post-detail-label">
                PUBLICAÇÃO
              </span>

            </header>

            <div className="post-detail-image">

              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=90"
                alt="Nova coleção da Loja Gruplace"
              />

            </div>

            <div className="post-detail-content">

              <div className="post-detail-store">
                Loja Gruplace
              </div>

              <div className="post-detail-meta">
                Shopping Gruplace · há 5 min
              </div>

              <div className="post-detail-tag">
                NOVA COLEÇÃO
              </div>

              <div className="post-detail-offer-label">
                OFERTA ESPECIAL
              </div>

              <h1 className="post-detail-title">
                10% OFF na coleção atual
              </h1>

              <p className="post-detail-description">
                Peças selecionadas da nova coleção para você aproveitar
                durante sua visita.
              </p>

              <div className="post-detail-context">
                Exclusivo para seguidores
              </div>

              <button
                className="post-detail-cta"
                type="button"
              >
                Ver oferta
              </button>

              <div className="post-detail-reward">

                <div className="post-detail-reward-label">
                  🎉 Benefício desbloqueado
                </div>

                <h2>
                  Você ganhou um cupom de boas-vindas!
                </h2>

                <div className="post-detail-discount">
                  10% OFF
                </div>

                <div className="post-detail-coupon">
                  BEMVINDO10
                </div>

                <p>
                  Valide o código no caixa da loja no shopping.
                </p>

                <button
                  type="button"
                  className="post-detail-copy"
                >
                  Copiar código
                </button>

              </div>

            </div>

          </div>
        ) : (
          <article
          className="card"
          id="postCard"
        >

          <header className="post-header">

            <div className="post-store">

              <div
                className="post-logo"
                aria-label="Logo Loja Gruplace"
              >
                LG
              </div>

              <div className="post-store-info">

                <div className="post-store-name">
                  Loja Gruplace
                </div>

                <div className="post-meta">

                  <span>
                    Shopping Gruplace
                  </span>

                  <span className="post-meta-dot">
                    ·
                  </span>

                  <span>
                    há 5 min
                  </span>

                </div>

              </div>

            </div>

            <button
              className="post-menu"
              type="button"
              aria-label="Mais opções"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="5"
                  cy="12"
                  r="1.5"
                  fill="currentColor"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="1.5"
                  fill="currentColor"
                />
                <circle
                  cx="19"
                  cy="12"
                  r="1.5"
                  fill="currentColor"
                />
              </svg>
            </button>

          </header>

          <div className="post-image">

            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=90"
              alt="Nova coleção da Loja Gruplace"
            />

            <div className="post-image-overlay" />

            <div className="post-tag">
              Nova coleção
            </div>

          </div>

          <div className="post-content">

            <div className="post-offer-label">
              OFERTA ESPECIAL
            </div>

            <h2 className="post-title">
              10% OFF na coleção atual
            </h2>

            <p className="post-description">
              Peças selecionadas da nova coleção para você aproveitar
              durante sua visita.
            </p>

            <div className="post-cta-row">

              <div className="post-offer-context">
                Exclusivo para seguidores
              </div>

              <button
                className="post-cta"
                type="button"
              >
                <span>
                  Ver oferta
                </span>

                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 17L17 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <path
                    d="M9 7H17V15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

            </div>

          </div>

          <div className="reward">

            <div className="reward-inner">

              <div className="reward-box">

                <div className="reward-label">
                  🎉 Benefício desbloqueado
                </div>

                <div className="reward-title">
                  Você ganhou um cupom de boas-vindas!
                </div>

                <div className="discount">
                  10% OFF
                </div>

                <div className="coupon">
                  BEMVINDO10
                </div>

                <div className="reward-description">
                  Valide o código no caixa da loja
                  no shopping.
                </div>

                <div className="reward-actions">

                  <button
                    className="button primary"
                    type="button"
                  >
                    Copiar código
                  </button>

                  <button
                    className="button secondary"
                    type="button"
                  >
                    Ver lançamentos
                  </button>

                </div>

              </div>

            </div>

          </div>

          <footer className="actions">

            <button
              className={`action${isLiked ? ' is-liked' : ''}`}
              type="button"
              aria-label={isLiked ? "Descurtir publicação" : "Curtir publicação"}
              aria-pressed={isLiked}
              onClick={() => setIsLiked((current) => !current)}
            >

              <span className="action-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20.8 8.8C20.8 13.2 12 19 12 19S3.2 13.2 3.2 8.8C3.2 6.1 5.1 4.2 7.5 4.2C9.2 4.2 10.8 5.1 12 6.6C13.2 5.1 14.8 4.2 16.5 4.2C18.9 4.2 20.8 6.1 20.8 8.8Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>

              </span>

              <span>
                {isLiked ? 'Curtido' : 'Curtir'}
              </span>

            </button>

            <button
              className={`action${isFollowing ? ' is-following' : ''}`}
              type="button"
              aria-label={isFollowing ? "Deixar de seguir loja" : "Seguir loja"}
              aria-pressed={isFollowing}
              onClick={() => setIsFollowing((current) => !current)}
            >

              <span className="action-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5V19"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

              </span>

              <span>
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </span>

            </button>

            <button
              className={`action${isPostDetailOpen ? ' is-open' : ''}`}
              type="button"
              aria-label={isPostDetailOpen ? "Fechar publicação" : "Abrir publicação"}
              aria-pressed={isPostDetailOpen}
              onClick={() => setIsPostDetailOpen((current) => !current)}
            >

              <span className="action-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 17L17 7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M9 7H17V15"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </span>

              <span>
                {isPostDetailOpen ? 'Aberto' : 'Abrir'}
              </span>

            </button>

          </footer>

          </article>
        )}

      </section>

    </main>
  )
}
