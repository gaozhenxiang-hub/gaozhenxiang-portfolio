import { siteContent } from "@/content/site";

import "./contact-finale.css";

export function ContactFinale() {
  return (
    <footer className="contact-finale" data-testid="contact-finale">
      <div className="contact-finale__identity">
        <h2>{siteContent.name}</h2>
        <p>{siteContent.tagline}</p>
      </div>

      <div className="contact-finale__details">
        <a aria-label={`电话 ${siteContent.phone}`} href={`tel:${siteContent.phone}`}>
          <span>电话</span>
          <strong>{siteContent.phone}</strong>
        </a>
        <a aria-label={`邮箱 ${siteContent.email}`} href={`mailto:${siteContent.email}`}>
          <span>邮箱</span>
          <strong>{siteContent.email}</strong>
        </a>
      </div>
    </footer>
  );
}
