import Link from 'next/link';
import { Facebook, Instagram, Music2, Send } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={`container-page ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>GS</span>
            <span>Golden Shifa</span>
          </Link>
          <p>Le meilleur de la nature, récolté avec passion pour votre bien-être.</p>
          <div className={styles.socials}>
            <Link href="/" aria-label="Facebook">
              <Facebook size={17} />
            </Link>
            <Link href="/" aria-label="Instagram">
              <Instagram size={17} />
            </Link>
            <Link href="/" aria-label="TikTok">
              <Music2 size={17} />
            </Link>
          </div>
        </div>

        <div className={styles.column}>
          <h3>Navigation</h3>
          <div>
            <Link href="/">Accueil</Link>
            <Link href="/produits">Produits</Link>
            <Link href="/categories">Catégories</Link>
            <Link href="/notre-histoire">Notre histoire</Link>
            <Link href="/#selection">Blog</Link>
            <Link href="/#contact">Contact</Link>
          </div>
        </div>

        <div className={styles.column}>
          <h3>Catégories</h3>
          <div>
            <Link href="/categories">Miels Monofloraux</Link>
            <Link href="/categories">Miels Toutes Fleurs</Link>
            <Link href="/categories">Miels Précieux</Link>
            <Link href="/categories">Coffrets Cadeaux</Link>
            <Link href="/categories">Produits de la Ruche</Link>
          </div>
        </div>

        <div className={styles.column}>
          <h3>Mon Compte</h3>
          <div>
            <Link href="/admin/login">Mon profil</Link>
            <Link href="/panier">Mes commandes</Link>
            <Link href="/panier">Panier</Link>
          </div>
        </div>

        <div className={styles.newsletter}>
          <h3>Newsletter</h3>
          <p>Restez informé de nos nouveautés et offres spéciales.</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Votre email" aria-label="Votre email" />
            <button type="button" aria-label="S'inscrire">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`container-page ${styles.bottom}`}>
        <span>© 2026 GoldenShifa. Tous droits réservés.</span>
        <div>
          <Link href="/">Mentions légales</Link>
          <Link href="/">Politique de confidentialité</Link>
          <Link href="/">CGV</Link>
        </div>
      </div>
    </footer>
  );
}
