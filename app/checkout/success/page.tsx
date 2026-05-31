import Link from 'next/link';
import { CheckCircle2, Flower2, Package, ShoppingBag, Truck } from 'lucide-react';
import styles from './page.module.css';

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className={styles.page}>
      <div className={styles.pageBg} />
      <div className={styles.pageGlow} />
      <div className={styles.pagePatternLeft} />
      <div className={styles.pagePatternRight} />

      <div className={`container-page ${styles.inner}`}>
        <div className={styles.steps}>
          {['Panier', 'Livraison', 'Confirmation'].map((step, i) => (
            <div key={step} className={styles.stepGroup}>
              <div className={`${styles.step} ${i < 2 ? styles.stepDone : styles.stepActive}`}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepLabel}>{step}</span>
              </div>
              {i < 2 && <div className={styles.stepLineDone} />}
            </div>
          ))}
        </div>

        <section className={styles.card}>
          <div className={styles.cardGlow} />

          <div className={styles.iconWrap}>
            <CheckCircle2 size={42} className={styles.successIcon} />
          </div>

          <div className={styles.copy}>
            <span className={styles.kicker}>
              <ShoppingBag size={13} />
              Commande envoyee
            </span>
            <h1 className={styles.title}>Commande confirmee</h1>
            <p className={styles.text}>
              {order ? (
                <>
                  Votre commande <strong>{order}</strong> a bien ete enregistree.
                </>
              ) : (
                'Votre commande a bien ete enregistree.'
              )}{' '}
              GoldenShifa vous contactera pour confirmer les details de livraison.
            </p>
          </div>

          <div className={styles.timeline}>
            {[
              { icon: CheckCircle2, label: 'Commande recue', text: 'Votre demande est sauvegardee.' },
              { icon: Package, label: 'Preparation', text: 'Nous preparons vos produits.' },
              { icon: Truck, label: 'Livraison', text: 'Vous serez contacte avant l envoi.' }
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className={styles.timelineItem}>
                <span className={styles.timelineIcon}>
                  <Icon size={16} />
                </span>
                <div>
                  <h2>{label}</h2>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href="/produits" className={styles.primaryButton}>
              <Flower2 size={16} />
              Continuer mes achats
            </Link>
            <Link href="/" className={styles.secondaryButton}>
              Retour a l accueil
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
