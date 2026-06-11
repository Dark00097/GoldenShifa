import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Flower2,
  Leaf,
  MapPin,
  Shield,
  Sparkles,
  Sun,
  Wind
} from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
  title: "Notre Histoire | Golden Shifa",
  description:
    "Découvrez l'histoire de Golden Shifa : un miel de jujubier sauvage né à Laghouat, au cœur du désert algérien. Une seule récolte par an. Une excellence préservée."
};

const stats = [
  { value: '1', label: 'Récolte par an' },
  { value: '100%', label: 'Naturel & pur' },
  { value: '+5', label: "Années d'expertise" },
  { value: 'Laghouat', label: 'Origine certifiée' }
];

const values = [
  {
    icon: Leaf,
    title: 'Respect de la nature',
    text: `Nos ruches sont installées loin de toute culture intensive et pollution, au cœur d'espaces sauvages et intacts où la nature règne encore en maître.`
  },
  {
    icon: Shield,
    title: 'Bien-être des abeilles',
    text: `Elles ne sont pas un moyen de production. Elles sont les gardiennes d'un patrimoine naturel exceptionnel. Nous les accompagnons avec patience et respect.`
  },
  {
    icon: Sun,
    title: 'Une seule récolte',
    text: `Parce que les plus belles choses exigent du temps. Nous ne réalisons qu'une seule récolte par an — rare, précieuse, irremplaçable.`
  },
  {
    icon: Sparkles,
    title: 'Excellence sans compromis',
    text: `Nous sélectionnons uniquement les meilleurs lots afin de préserver l'intégrité et la pureté de notre miel de jujubier premium.`
  }
];

const slogans = [
  "L'âme de Laghouat dans chaque goutte.",
  "Le trésor du jujubier du désert algérien.",
  "Une récolte. Une année. Une excellence.",
  "Né dans le désert. Façonné par le temps."
];

export default function NotreHistoirePage() {
  return (
    <main className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroShade} />
        <Image
          src="/uploads/1778348867545-chatgpt-image-9-mai-2026-18-23-16.png"
          alt="Les terres de Laghouat"
          fill
          priority
          className={styles.heroImage}
          sizes="100vw"
        />

        <div className={`container-page ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <MapPin size={14} />
              Laghouat, Algérie
            </div>
            <h1>
              L'Héritage des Terres
              <br />
              <span>de Laghouat</span>
            </h1>
            <p className={styles.heroLead}>
              Bien avant que le désert ne révèle ses secrets aux voyageurs, les anciens de
              Laghouat connaissaient déjà la valeur du jujubier sauvage. Cette histoire,
              c'est la nôtre.
            </p>
            <Link href="/produits" className={styles.primaryButton}>
              Découvrir notre miel
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* stat ribbon */}
        <div className={`container-page ${styles.statRibbonWrap}`}>
          <div className={styles.statRibbon}>
            {stats.map(({ value, label }) => (
              <div className={styles.statItem} key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section className={styles.originSection}>
        <div className={`container-page ${styles.originInner}`}>

          <div className={styles.originMedia}>
            <div className={styles.originPhotoWrap}>
              <Image
                src="https://images.unsplash.com/photo-1577048982768-5cb3e7ddfa24?auto=format&fit=crop&w=900&q=85"
                alt="Jujubier sauvage de Laghouat"
                fill
                className={styles.originPhoto}
                sizes="(max-width: 980px) 100vw, 520px"
              />
              <div className={styles.originPhotoOverlay} />
            </div>
            <div className={styles.originBadge}>
              <Flower2 size={20} />
              <span>Depuis des générations</span>
            </div>
          </div>

          <div className={styles.originCopy}>
            <p className={styles.sectionKicker}>Notre histoire</p>
            <h2>Une famille née à Laghouat</h2>

            <div className={styles.originText}>
              <p>
                Dans cette terre où le Sahara rencontre les hauts plateaux algériens, le
                jujubier sauvage défie depuis des siècles la sécheresse, les vents et le
                temps. Ses racines plongent profondément dans une terre chargée d'histoire,
                tandis que ses fleurs offrent un nectar rare que seules les abeilles savent
                transformer en un miel d'exception.
              </p>
              <p>
                <strong>Notre famille est née ici.</strong> Au fil des générations, nous
                avons grandi au rythme des saisons de Laghouat, admirant la beauté brute de
                ses paysages, la richesse de ses traditions et le lien profond qui unit
                l'homme à la nature.
              </p>
              <p>
                Puis un rêve est né — celui de révéler au monde l'un des plus précieux
                trésors de notre région : le miel de jujubier du désert algérien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LAND SECTION ── */}
      <section className={styles.landSection}>
        <div className={styles.landTexture} />
        <div className={`container-page ${styles.landInner}`}>

          <div className={styles.landCopy}>
            <p className={styles.sectionKicker}>Une terre d'exception</p>
            <h2>
              Laghouat — une porte
              <br />
              entre deux mondes
            </h2>
            <p>
              Une terre où les oasis émergent du désert, où les caravanes ont autrefois
              traversé les horizons infinis du Sahara et où la nature offre encore des
              trésors préservés.
            </p>
            <p>
              C'est dans ces espaces sauvages et intacts que nos ruches trouvent leur place.
              Loin des cultures intensives. Loin de toute pollution. Au cœur d'un
              environnement où la nature règne encore en maître.
            </p>
            <ul className={styles.landList}>
              {[
                { icon: Wind, text: 'Éloigné de toute pollution industrielle' },
                { icon: Sun, text: 'Ensoleillement exceptionnel du Sahara algérien' },
                { icon: Flower2, text: 'Floraison sauvage du jujubier non traitée' },
                { icon: Leaf, text: 'Ecosystème intact préservé des générations' }
              ].map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span className={styles.landListIcon}><Icon size={16} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.landMedia}>
            <div className={styles.landPhotoStack}>
              <div className={styles.landPhotoMain}>
                <Image
                  src="https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=85"
                  alt="Ruches au cœur du désert de Laghouat"
                  fill
                  className={styles.landPhoto}
                  sizes="(max-width: 980px) 100vw, 560px"
                />
              </div>
              <div className={styles.landPhotoSecondary}>
                <Image
                  src="https://images.unsplash.com/photo-1578922794704-7bdd46f70ce0?auto=format&fit=crop&w=600&q=85"
                  alt="Abeilles et fleurs de jujubier"
                  fill
                  className={styles.landPhoto}
                  sizes="240px"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── VALUES ── */}
      <section className={styles.valuesSection}>
        <div className={`container-page`}>
          <div className={styles.valuesHeader}>
            <p className={styles.sectionKicker}>Nos engagements</p>
            <h2>Le respect avant tout</h2>
            <span>
              Nous croyons que la qualité d'un miel commence par le bien-être des abeilles
              et le respect absolu de la nature.
            </span>
          </div>

          <div className={styles.valuesGrid}>
            {values.map(({ icon: Icon, title, text }) => (
              <div className={styles.valueCard} key={title}>
                <div className={styles.valueIcon}>
                  <Icon size={26} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RARITY ── */}
      <section className={styles.raritySection}>
        <div className={`container-page ${styles.rarityInner}`}>

          <div className={styles.rarityMedia}>
            <div className={styles.rarityPhotoWrap}>
              <Image
                src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=900&q=85"
                alt="Miel de jujubier premium de Laghouat"
                fill
                className={styles.rarityPhoto}
                sizes="(max-width: 980px) 100vw, 540px"
              />
              <div className={styles.rarityOverlay} />
            </div>
          </div>

          <div className={styles.rarityCopy}>
            <p className={styles.sectionKicker}>La rareté comme signature</p>
            <h2>
              Une récolte.
              <br />
              Une année.
              <br />
              Une excellence.
            </h2>
            <p>
              Dans un monde où tout va toujours plus vite, nous avons choisi une autre voie
              — celle de la patience et de l'excellence.
            </p>
            <p>
              Chaque saison est unique. Chaque floraison est différente. Chaque récolte est
              limitée. Nous sélectionnons uniquement les meilleurs lots afin de préserver
              l'intégrité et la pureté de notre miel.
            </p>
            <p>
              Ce choix exigeant donne naissance à un miel de jujubier premium à la texture
              veloutée, aux notes profondes et à la richesse aromatique incomparable — un
              miel recherché par les connaisseurs qui savent reconnaître la valeur de
              l'authentique.
            </p>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO / SLOGANS ── */}
      <section className={styles.manifestoSection}>
        <div className={styles.manifestoTexture} />
        <div className={`container-page ${styles.manifestoInner}`}>
          <p className={styles.sectionKicker}>Notre signature</p>
          <h2>Plus qu'un miel, une signature</h2>
          <blockquote className={styles.manifestoQuote}>
            Au cœur des terres de Laghouat, nos abeilles récoltent chaque année le nectar
            précieux du jujubier sauvage. Une seule floraison. Une seule récolte. Un miel
            rare né du respect de la nature, de l'amour d'une famille pour sa terre et de
            l'héritage d'un désert qui façonne l'excellence depuis des siècles.
          </blockquote>

          <div className={styles.sloganGrid}>
            {slogans.map((s) => (
              <div className={styles.sloganCard} key={s}>
                <Flower2 size={16} className={styles.sloganIcon} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERITAGE CLOSING ── */}
      <section className={styles.heritageSection}>
        <div className={`container-page ${styles.heritageInner}`}>
          <div className={styles.heritageCopy}>
            <p className={styles.sectionKicker}>Notre héritage</p>
            <h2>Né à Laghouat. Façonné par le temps.</h2>
            <p>
              Chaque pot est le reflet d'une histoire familiale. Chaque goutte porte la
              mémoire de Laghouat. Chaque dégustation est un voyage au cœur du désert
              algérien.
            </p>
            <p>
              Nous ne vendons pas simplement du miel. Nous partageons un héritage — celui
              d'une famille attachée à sa terre, celui d'abeilles élevées avec respect,
              celui d'une région dont la beauté mérite d'être célébrée.
            </p>
            <div className={styles.heritageActions}>
              <Link href="/produits" className={styles.primaryButton}>
                Commander notre miel
                <ArrowRight size={16} />
              </Link>
              <Link href="/categories" className={styles.outlineButton}>
                Voir toutes les catégories
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className={styles.heritageStats}>
            {[
              { value: 'Laghouat', label: 'Origine exclusive' },
              { value: '1×', label: 'Récolte annuelle' },
              { value: '100%', label: 'Sauvage & naturel' },
              { value: '∞', label: 'Générations de savoir-faire' }
            ].map(({ value, label }) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
