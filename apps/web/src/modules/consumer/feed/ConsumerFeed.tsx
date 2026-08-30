import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

import "./ConsumerFeed.css";

type ConsumerFeedProps = {
  shoppingId: string | null;
};

type Publication = {
  id: string;
  title: string | null;
  description: string | null;
  type: string | null;
  image_url: string | null;
  cta_label: string | null;
  published_at: string | null;
  store_id: string | null;
};

type Store = {
  tenant_id: string;
  trade_name: string | null;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string | null;
  slug: string | null;
};

export function ConsumerFeed({ shoppingId }: ConsumerFeedProps) {
  const [shoppingName, setShoppingName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [publication, setPublication] = useState<Publication | null>(null);

  const [consumerInterests, setConsumerInterests] = useState<string[]>([]);

  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  const [isOfferRevealed, setIsOfferRevealed] = useState(false);

  const [isCouponCopied, setIsCouponCopied] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadShopping() {
      if (!shoppingId) {
        return;
      }

      const { data: shopping, error } = await supabase
        .from("shopping_centers")
        .select("name")
        .eq("id", shoppingId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Erro ao carregar shopping:", error);
        return;
      }

      if (isMounted) {
        setShoppingName(shopping?.name ?? "");
      }
    }

    async function loadConsumerInterests() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erro ao identificar consumidor:", userError);
        return [];
      }

      const { data: interests, error: interestsError } = await supabase
        .from("user_interests")
        .select(
          `
          category_id,
          catalog_categories (
            name,
            slug
          )
        `,
        )
        .eq("user_id", user.id);

      if (interestsError) {
        console.error("Erro ao carregar interesses:", interestsError);
        return [];
      }

      const interestNames =
        interests
          ?.map((item) => {
            const category = Array.isArray(item.catalog_categories)
              ? item.catalog_categories[0]
              : item.catalog_categories;

            return category?.name ?? "";
          })
          .filter(Boolean) ?? [];

      console.log("CONSUMER INTERESTS:", interestNames);

      if (isMounted) {
        setConsumerInterests(interestNames);
      }

      return interestNames;
    }

    async function loadPublications(interestNames: string[]) {
      const { data: publications, error } = await supabase
        .from("publications")
        .select(
          `
          id,
          title,
          description,
          type,
          image_url,
          cta_label,
          published_at,
          store_id
        `,
        )
        .eq("shopping_center_id", shoppingId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("published_at", {
          ascending: false,
        });

      if (error) {
        console.error("Erro ao carregar publicações:", error);
        return;
      }

      if (!publications || publications.length === 0) {
        console.log("Nenhuma publicação encontrada.");

        if (isMounted) {
          setPublication(null);
          setStoreName("");
          setIsFollowing(false);
        }

        return;
      }

      console.log("PUBLICATIONS:", publications);

      let selectedPublication = publications[0] as Publication;

      let selectedStoreName = "";

      /*
       * ------------------------------------------------------------
       * PRIORIZAÇÃO POR INTERESSE
       * ------------------------------------------------------------
       */

      if (interestNames.length > 0) {
        for (const candidate of publications) {
          const candidatePublication = candidate as Publication;

          if (!candidatePublication.store_id) {
            continue;
          }

          const { data: candidateStore, error: candidateStoreError } =
            await supabase
              .from("stores")
              .select(
                `
              trade_name,
              category_id,
              tenant_id
            `,
              )
              .eq("id", candidatePublication.store_id)
              .eq("is_active", true)
              .maybeSingle();

          if (candidateStoreError) {
            console.error(
              "Erro ao carregar loja da publicação:",
              candidateStoreError,
            );
            continue;
          }

          if (!candidateStore) {
            continue;
          }

          const store = candidateStore as Store;

          console.log("CANDIDATE STORE:", store);

          if (!store.category_id) {
            continue;
          }

          const { data: candidateCategory, error: candidateCategoryError } =
            await supabase
              .from("catalog_categories")
              .select(
                `
              id,
              name,
              slug
            `,
              )
              .eq("id", store.category_id)
              .maybeSingle();

          if (candidateCategoryError) {
            console.error(
              "Erro ao carregar categoria:",
              candidateCategoryError,
            );
            continue;
          }

          if (!candidateCategory) {
            continue;
          }

          const category = candidateCategory as Category;

          console.log("CANDIDATE CATEGORY:", category);

          const categoryName = category.name ?? "";

          const isMatch = interestNames.some(
            (interest) => interest.toLowerCase() === categoryName.toLowerCase(),
          );

          console.log("CATEGORY MATCH:", categoryName, isMatch);

          if (isMatch) {
            selectedPublication = candidatePublication;

            selectedStoreName = store.trade_name ?? "";

            console.log(
              "PUBLICAÇÃO PRIORIZADA POR INTERESSE:",
              selectedPublication,
            );

            console.log("LOJA PRIORIZADA:", selectedStoreName);

            console.log("CATEGORIA PRIORIZADA:", category.name);

            break;
          }
        }
      }

      /*
       * ------------------------------------------------------------
       * LOJA DA PUBLICAÇÃO SELECIONADA
       * ------------------------------------------------------------
       */

      if (!selectedStoreName && selectedPublication.store_id) {
        const { data: selectedStore, error: selectedStoreError } =
          await supabase
            .from("stores")
            .select(
              `
            trade_name,
            category_id,
            tenant_id
          `,
            )
            .eq("id", selectedPublication.store_id)
            .eq("is_active", true)
            .maybeSingle();

        if (selectedStoreError) {
          console.error(
            "Erro ao carregar loja selecionada:",
            selectedStoreError,
          );
        } else {
          const store = selectedStore as Store | null;

          selectedStoreName = store?.trade_name ?? "";

          console.log("SELECTED STORE:", store);
        }
      }

      console.log("SELECTED PUBLICATION:", selectedPublication);

      console.log("SELECTED STORE NAME:", selectedStoreName);

      if (isMounted) {
        setPublication(selectedPublication);
        setStoreName(selectedStoreName);
      }
    }

    async function loadFeed() {
      if (!shoppingId) {
        return;
      }

      await loadShopping();

      const interests = await loadConsumerInterests();

      await loadPublications(interests ?? []);
    }

    void loadFeed();

    return () => {
      isMounted = false;
    };
  }, [shoppingId]);

  /*
   * ------------------------------------------------------------
   * CARREGAR ESTADO DA CURTIDA
   * ------------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    async function loadLikeState() {
      if (!publication?.id) {
        if (isMounted) {
          setIsLiked(false);
        }
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMounted) {
          setIsLiked(false);
        }
        return;
      }

      const { data: like, error: likeError } = await supabase
        .from("publication_likes")
        .select("publication_id")
        .eq("publication_id", publication.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (likeError) {
        console.error("Erro ao carregar curtida:", likeError);
        return;
      }

      if (isMounted) {
        setIsLiked(!!like);
      }
    }

    void loadLikeState();

    return () => {
      isMounted = false;
    };
  }, [publication?.id]);

  /*
   * ------------------------------------------------------------
   * CARREGAR ESTADO DE SEGUIMENTO DA LOJA
   * ------------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    async function loadFollowingState() {
      if (!publication?.store_id) {
        if (isMounted) {
          setIsFollowing(false);
        }
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMounted) {
          setIsFollowing(false);
        }
        return;
      }

      const { data: follower, error: followerError } = await supabase
        .from("store_followers")
        .select("id")
        .eq("store_id", publication.store_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (followerError) {
        console.error("Erro ao carregar estado de seguimento:", followerError);

        if (isMounted) {
          setIsFollowing(false);
        }

        return;
      }

      if (isMounted) {
        setIsFollowing(!!follower);
      }
    }

    void loadFollowingState();

    return () => {
      isMounted = false;
    };
  }, [publication?.store_id]);

  /*
   * ------------------------------------------------------------
   * CARREGAR ESTADO DE SALVAMENTO
   * ------------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    async function loadSaveState() {
      if (!publication?.id) {
        if (isMounted) {
          setIsSaved(false);
        }
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMounted) {
          setIsSaved(false);
        }
        return;
      }

      const { data: save, error: saveError } = await supabase
        .from("publication_saves")
        .select("publication_id")
        .eq("publication_id", publication.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (saveError) {
        console.error("Erro ao carregar salvamento:", saveError);

        if (isMounted) {
          setIsSaved(false);
        }

        return;
      }

      if (isMounted) {
        setIsSaved(!!save);
      }
    }

    void loadSaveState();

    return () => {
      isMounted = false;
    };
  }, [publication?.id]);

  function handleOpenDetail() {
    setIsPostDetailOpen(true);
  }

  function handleCloseDetail() {
    setIsPostDetailOpen(false);
  }

  async function handleToggleLike() {
    if (!publication?.id) {
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Usuário não autenticado para curtir publicação.",
        userError,
      );
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from("publication_likes")
        .delete()
        .eq("publication_id", publication.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao remover curtida:", error);
        return;
      }

      setIsLiked(false);
      return;
    }

    const { error } = await supabase.from("publication_likes").insert({
      publication_id: publication.id,
      user_id: user.id,
    });

    if (error) {
      console.error("Erro ao registrar curtida:", error);
      return;
    }

    setIsLiked(true);
  }

  /*
   * ------------------------------------------------------------
   * SEGUIR / DEIXAR DE SEGUIR LOJA
   * ------------------------------------------------------------
   */

  async function handleToggleFollowing() {
    if (!publication?.store_id) {
      console.error("Publicação sem store_id.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Usuário não autenticado.", userError);
      return;
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("tenant_id")
      .eq("id", publication.store_id)
      .single();

    if (storeError || !store) {
      console.error("Erro ao carregar tenant_id da loja:", storeError);
      return;
    }

    if (isFollowing) {
      const { error } = await supabase
        .from("store_followers")
        .delete()
        .eq("store_id", publication.store_id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao deixar de seguir loja:", error);
        return;
      }

      setIsFollowing(false);
      return;
    }

    const { error } = await supabase.from("store_followers").insert({
      tenant_id: store.tenant_id,
      store_id: publication.store_id,
      user_id: user.id,
    });

    if (error) {
      console.error("Erro ao seguir loja:", error);
      return;
    }

    setIsFollowing(true);
  }

  function handleToggleOffer() {
    setIsOfferRevealed((current) => !current);
  }

  async function handleToggleSave() {
    if (!publication?.id) {
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Usuário não autenticado para salvar publicação.",
        userError,
      );
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from("publication_saves")
        .delete()
        .eq("publication_id", publication.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao remover publicação salva:", error);
        return;
      }

      setIsSaved(false);
      return;
    }

    const { error } = await supabase.from("publication_saves").insert({
      publication_id: publication.id,
      user_id: user.id,
    });

    if (error) {
      console.error("Erro ao salvar publicação:", error);
      return;
    }

    setIsSaved(true);
  }

  async function handleCopyCoupon() {
    try {
      await navigator.clipboard.writeText("BEMVINDO10");

      setIsCouponCopied(true);

      window.setTimeout(() => {
        setIsCouponCopied(false);
      }, 2500);
    } catch {
      setIsCouponCopied(false);
    }
  }

  async function handleShare() {
    if (!publication) {
      return;
    }

    const shareData = {
      title: publication.title ?? "Gruplace",
      text: publication.description ?? "Confira esta publicação no Gruplace.",
      url: window.location.href,
    };

    try {
      if (navigator.share && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      window.alert("Link copiado para a área de transferência.");
    } catch {
      // Compartilhamento cancelado pelo usuário.
    }
  }

  const imageUrl =
    publication?.image_url ??
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=90";

  const publicationTitle = publication?.title ?? "Publicação da loja";

  const publicationDescription =
    publication?.description ?? "Confira esta publicação da loja.";

  const ctaLabel = publication?.cta_label ?? "Ver oferta";

  return (
    <main className="consumer-feed">
      <header className="consumer-feed-header">
        <div>
          <span className="consumer-feed-brand">gruplace</span>

          <p className="consumer-feed-shopping">
            {shoppingName || "Carregando shopping..."}
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
        <div className="consumer-feed-interests-debug">
          {consumerInterests.length > 0 && (
            <small>Interesses: {consumerInterests.join(", ")}</small>
          )}
        </div>

        <span className="consumer-feed-label">PARA VOCÊ</span>

        <h1>Descubra o que está acontecendo.</h1>

        <p>Lojas, novidades, ofertas e experiências escolhidas para você.</p>
      </section>

      <nav className="consumer-feed-filters" aria-label="Filtros do feed">
        <button className="active" type="button">
          Todos
        </button>

        <button type="button">Ofertas</button>

        <button type="button">Novidades</button>

        <button type="button">Eventos</button>

        <button type="button">Cupons</button>

        <button type="button">Lançamentos</button>
      </nav>

      <section className="consumer-feed-tools">
        <button
          className="consumer-feed-tool"
          type="button"
          onClick={() => setIsMapOpen(true)}
        >
          <span className="consumer-feed-tool-icon">MAPA</span>

          <span className="consumer-feed-tool-content">
            <strong>Explorar o shopping</strong>

            <small>Encontre lojas, restaurantes e serviços.</small>
          </span>

          <span className="consumer-feed-tool-arrow">→</span>
        </button>
      </section>

      {isMapOpen && (
        <section className="consumer-feed-map">
          <div className="consumer-feed-map-header">
            <div>
              <span className="consumer-feed-label">MAPA DO SHOPPING</span>

              <h2>Explore o shopping.</h2>

              <p>
                Encontre lojas, restaurantes, serviços e outros pontos de
                interesse.
              </p>
            </div>

            <button
              type="button"
              className="consumer-feed-map-button"
              onClick={() => setIsMapOpen(false)}
            >
              FECHAR MAPA
            </button>
          </div>

          <div className="consumer-feed-map-preview">
            <div className="consumer-feed-map-floor">PISO 1</div>

            <img
              alt="Mapa do Piso 1 do shopping"
              className="consumer-feed-map-svg"
              src="/maps/mapa-piso-1-planta.svg"
            />
          </div>
        </section>
      )}

      <section className="consumer-feed-content">
        {isPostDetailOpen ? (
          <div className="post-detail">
            <header className="post-detail-header">
              <button
                className="post-detail-back"
                type="button"
                onClick={handleCloseDetail}
              >
                ← Voltar
              </button>

              <span className="post-detail-label">PUBLICAÇÃO</span>
            </header>

            <div className="post-detail-image">
              <img src={imageUrl} alt={publicationTitle} />
            </div>

            <div className="post-detail-content">
              <div className="post-detail-store">
                {storeName || "Loja Gruplace"}
              </div>

              <div className="post-detail-meta">
                {shoppingName || "Shopping Gruplace"}
                {" · "}
                há 5 min
              </div>

              <div className="post-detail-tag">
                {publication?.type === "promotion" ? "OFERTA" : "NOVIDADE"}
              </div>

              <div className="post-detail-offer-label">OFERTA ESPECIAL</div>

              <h1 className="post-detail-title">{publicationTitle}</h1>

              <p className="post-detail-description">
                {publicationDescription}
              </p>

              <div className="post-detail-context">
                Exclusivo para seguidores
              </div>

              <button
                className={
                  isOfferRevealed
                    ? "post-detail-cta is-revealed"
                    : "post-detail-cta"
                }
                type="button"
                aria-label={isOfferRevealed ? "Oferta ativada" : "Ver oferta"}
                aria-pressed={isOfferRevealed}
                onClick={handleToggleOffer}
              >
                {isOfferRevealed ? "Oferta ativada" : "Ver oferta"}
              </button>

              {isOfferRevealed && (
                <div className="post-detail-reward">
                  <div className="post-detail-reward-label">
                    🎉 Benefício desbloqueado
                  </div>

                  <h2>Você ganhou um cupom de boas-vindas!</h2>

                  <div className="post-detail-discount">10% OFF</div>

                  <div className="post-detail-coupon">BEMVINDO10</div>

                  <p>Valide o código no caixa da loja no shopping.</p>

                  <button
                    type="button"
                    className="post-detail-copy"
                    onClick={handleCopyCoupon}
                  >
                    {isCouponCopied ? "Código copiado" : "Copiar código"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <article className="card" id="postCard">
            <header className="post-header">
              <div className="post-store">
                <div className="post-logo" aria-label="Logo da loja">
                  LG
                </div>

                <div className="post-store-info">
                  <div className="post-store-name">
                    {storeName || "Carregando loja..."}
                  </div>

                  <div className="post-meta">
                    <span>{shoppingName || "Shopping Gruplace"}</span>

                    <span className="post-meta-dot">·</span>

                    <span>há 5 min</span>
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
                  <circle cx="5" cy="12" r="1.5" fill="currentColor" />

                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />

                  <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </header>

            <div className="post-image">
              <img src={imageUrl} alt={publicationTitle} />

              <div className="post-image-overlay" />

              <div className="post-tag">
                {publication?.type === "promotion" ? "Oferta" : "Novidade"}
              </div>
            </div>

            <div className="post-content">
              <div className="post-offer-label">OFERTA ESPECIAL</div>

              <h2 className="post-title">
                {publication?.title ?? "Carregando publicação..."}
              </h2>

              <p className="post-description">
                {publication?.description ?? "Carregando publicação..."}
              </p>

              <div className="post-cta-row">
                <div className="post-offer-context">
                  Exclusivo para seguidores
                </div>

                <button
                  className="post-cta"
                  type="button"
                  onClick={handleOpenDetail}
                >
                  <span>{ctaLabel}</span>

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
                  <div className="reward-label">🎉 Benefício desbloqueado</div>

                  <div className="reward-title">
                    Você ganhou um cupom de boas-vindas!
                  </div>

                  <div className="discount">10% OFF</div>

                  <div className="coupon">BEMVINDO10</div>

                  <div className="reward-description">
                    Valide o código no caixa da loja no shopping.
                  </div>

                  <div className="reward-actions">
                    <button
                      className="button primary"
                      type="button"
                      onClick={handleCopyCoupon}
                    >
                      {isCouponCopied ? "Código copiado" : "Copiar código"}
                    </button>

                    <button
                      className="button secondary"
                      type="button"
                      onClick={handleOpenDetail}
                    >
                      Ver lançamentos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="actions">
              <button
                className={isLiked ? "action is-liked" : "action"}
                type="button"
                aria-label={
                  isLiked ? "Descurtir publicação" : "Curtir publicação"
                }
                aria-pressed={isLiked}
                onClick={handleToggleLike}
              >
                <span className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M20.8 8.8C20.8 13.2 12 19 12 19S3.2 13.2 3.2 8.8C3.2 6.1 5.1 4.2 7.5 4.2C9.2 4.2 10.8 5.1 12 6.6C13.2 5.1 14.8 4.2 16.5 4.2C18.9 4.2 20.8 6.1 20.8 8.8Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{isLiked ? "Curtido" : "Curtir"}</span>
              </button>

              <button
                className={isFollowing ? "action is-following" : "action"}
                type="button"
                aria-label={
                  isFollowing ? "Deixar de seguir loja" : "Seguir loja"
                }
                aria-pressed={isFollowing}
                onClick={handleToggleFollowing}
              >
                <span className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

                <span>{isFollowing ? "Seguindo" : "Seguir"}</span>
              </button>

              <button
                className={isSaved ? "action is-saved" : "action"}
                type="button"
                aria-label={
                  isSaved
                    ? "Remover publicação dos salvos"
                    : "Salvar publicação"
                }
                aria-pressed={isSaved}
                onClick={handleToggleSave}
              >
                <span className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 4.5C6 3.67 6.67 3 7.5 3H16.5C17.33 3 18 3.67 18 4.5V21L12 17.5L6 21V4.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{isSaved ? "Salvo" : "Salvar"}</span>
              </button>

              <button
                className="action"
                type="button"
                aria-label="Compartilhar publicação"
                onClick={handleShare}
              >
                <span className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 16V4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <path
                      d="M8 8L12 4L16 8"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M5 13V19H19V13"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>Compartilhar</span>
              </button>

              <button
                className={isPostDetailOpen ? "action is-open" : "action"}
                type="button"
                aria-label={
                  isPostDetailOpen ? "Fechar publicação" : "Abrir publicação"
                }
                aria-pressed={isPostDetailOpen}
                onClick={() => {
                  if (isPostDetailOpen) {
                    handleCloseDetail();
                  } else {
                    handleOpenDetail();
                  }
                }}
              >
                <span className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

                <span>{isPostDetailOpen ? "Aberto" : "Abrir"}</span>
              </button>
            </footer>
          </article>
        )}
      </section>
    </main>
  );
}
