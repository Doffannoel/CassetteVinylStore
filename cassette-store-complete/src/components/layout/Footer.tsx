import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-text-primary text-primary-bg">
      {/* Main Footer Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Store Information */}
          <div>
            <h3 className="text-xl font-heading mb-2 text-accent-gold">Hysteria Music</h3>
            <p className="text-primary-bg/80 mb-2 text-sm">
              Your ultimate destination for vinyl records, CDs, and cassettes. Discover timeless
              music in every format.
            </p>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent-gold" />
                <span className="text-xs">Jl. Malioboro No. 123, Yogyakarta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-accent-gold" />
                <span className="text-xs">+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-accent-gold" />
                <span className="text-xs">info@cassettestore.com</span>
              </div>
            </div>
          </div>

          {/* Store Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-2 text-accent-gold">Store Hours</h4>
            <div className="space-y-0.5 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-accent-gold" />
                <div>
                  <p className="font-medium">Monday - Friday</p>
                  <p className="text-primary-bg/80 text-xs">10:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-accent-gold" />
                <div>
                  <p className="font-medium">Saturday - Sunday</p>
                  <p className="text-primary-bg/80 text-xs">9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-2 text-accent-gold">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="/products"
                  className="text-primary-bg/80 hover:text-accent-gold transition-colors"
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="/products?category=vinyl"
                  className="text-primary-bg/80 hover:text-accent-gold transition-colors"
                >
                  Vinyl Records
                </a>
              </li>
              <li>
                <a
                  href="/products?category=cd"
                  className="text-primary-bg/80 hover:text-accent-gold transition-colors"
                >
                  CDs
                </a>
              </li>
              <li>
                <a
                  href="/products?category=cassette"
                  className="text-primary-bg/80 hover:text-accent-gold transition-colors"
                >
                  Cassettes
                </a>
              </li>
              <li>
                <a
                  href="/products?featured=true"
                  className="text-primary-bg/80 hover:text-accent-gold transition-colors"
                >
                  Featured Items
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-2 text-accent-gold">Follow Us</h4>
            <div className="flex gap-2">
              <a
                href="https://instagram.com/cassettestore"
                className="bg-accent-gold p-1.5 rounded-full hover:bg-accent-hover transition-colors"
                title="Follow us on Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com/cassettestore"
                className="bg-accent-gold p-1.5 rounded-full hover:bg-accent-hover transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://twitter.com/cassettestore"
                className="bg-accent-gold p-1.5 rounded-full hover:bg-accent-hover transition-colors"
                title="Follow us on Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://youtube.com/cassettestore"
                className="bg-accent-gold p-1.5 rounded-full hover:bg-accent-hover transition-colors"
                title="Subscribe to our YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-text-primary border-t border-primary-bg/20 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-bg/80">
              &copy; 2024 Hysteria Music. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="/privacy"
                className="text-primary-bg/80 hover:text-accent-gold transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-primary-bg/80 hover:text-accent-gold transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                className="text-primary-bg/80 hover:text-accent-gold transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
