import { Link } from "wouter";
import { Leaf, MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Leaf className="text-primary text-2xl" />
              <h3 className="text-xl font-montserrat font-bold">
                <span className="text-primary">Plant</span>Pals
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Connecting plant vendors with corporate clients to create greener, healthier workspaces.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaFacebookF className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaLinkedinIn className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/plants" className="text-gray-300 hover:text-primary transition-colors">Plants Catalog</Link></li>
              <li><Link href="/vendors" className="text-gray-300 hover:text-primary transition-colors">Vendor Directory</Link></li>
              <li><Link href="/care-guides" className="text-gray-300 hover:text-primary transition-colors">Care Guides</Link></li>
              <li><Link href="/for-business" className="text-gray-300 hover:text-primary transition-colors">Corporate Solutions</Link></li>
              <li><Link href="/become-vendor" className="text-gray-300 hover:text-primary transition-colors">Become a Vendor</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-300 hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="text-gray-300 hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-gray-300 hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/plant-care" className="text-gray-300 hover:text-primary transition-colors">Plant Care Support</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 text-primary" />
                <span>123 Green Street, Suite 500<br/>New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 text-primary" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 text-primary" />
                <span>hello@plantpals.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="mr-3 text-primary" />
                <span>Mon-Fri: 9AM-6PM EST</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} PlantPals. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-400 text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 text-sm hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-gray-400 text-sm hover:text-primary transition-colors">Cookies Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
