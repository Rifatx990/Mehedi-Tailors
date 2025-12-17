import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon
} from '@heroicons/react/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Shop: [
      { name: 'Shirts', href: '/shop?category=Shirts' },
      { name: 'Pants', href: '/shop?category=Pants' },
      { name: 'Suits', href: '/shop?category=Suits' },
      { name: 'Traditional', href: '/shop?category=Traditional' },
    ],
    Services: [
      { name: 'Custom Tailoring', href: '/custom-tailoring' },
      { name: 'Alteration Services', href: '/services/alterations' },
      { name: 'Design Consultation', href: '/services/consultation' },
      { name: 'Bulk Orders', href: '/services/bulk' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    Support: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Shipping Policy', href: '/shipping' },
      { name: 'Returns & Exchange', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
              Mehedi Tailors
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Premium clothing shop and expert tailoring services. Experience the perfect blend 
              of traditional craftsmanship and modern fashion.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <PhoneIcon className="h-5 w-5 mr-3" />
                <span>+880 1720-267213</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MailIcon className="h-5 w-5 mr-3" />
                <span>info@meheditailors.com</span>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPinIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <span>
                  Dhonaid,Ashulia,Savar<br />
                  Dhaka 1341, Bangladesh
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                <TwitterIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {currentYear} Mehedi Tailors And Fabrics. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
