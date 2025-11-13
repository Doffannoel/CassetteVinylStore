'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import {
  ChevronRight,
  Music,
  Disc,
  Headphones,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Carousel data with static images
  const carouselSlides = [
    {
      id: 1,
      title: 'Vinyl Collection',
      subtitle: 'Timeless Analog Sound',
      description: 'Discover our premium vinyl records from legendary artists',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
      cta: 'Explore Vinyl',
      link: '/products?category=vinyl',
    },
    {
      id: 2,
      title: 'Rare Cassettes',
      subtitle: 'Retro Audio Experience',
      description: 'Limited edition cassettes from the golden era of music',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1200&h=600&fit=crop',
      cta: 'Shop Cassettes',
      link: '/products?category=cassette',
    },
    {
      id: 3,
      title: 'CD Classics',
      subtitle: 'Crystal Clear Digital',
      description: 'Immerse yourself in high-quality CD recordings',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
      cta: 'Browse CDs',
      link: '/products?category=cd',
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=8');
      const data = await response.json();
      if (data.success) {
        setFeaturedProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Vinyl',
      icon: <Disc className="w-12 h-12" />,
      description: 'Classic analog sound',
      link: '/products?category=vinyl',
      color: 'bg-accent-gold',
    },
    {
      name: 'CD',
      icon: <Music className="w-12 h-12" />,
      description: 'Digital clarity',
      link: '/products?category=cd',
      color: 'bg-text-primary',
    },
    {
      name: 'Cassette',
      icon: <Headphones className="w-12 h-12" />,
      description: 'Retro vibes',
      link: '/products?category=cassette',
      color: 'bg-text-link',
    },
  ];

  return (
    <>
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-screen">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/50" />
              </div>
            </div>
          ))}

          {/* Content Overlay */}
          <div className="relative container h-full flex items-center">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl lg:text-7xl font-heading mb-6 leading-tight">
                YOUR MUSIC,
                <br />
                OUR PASSION
              </h1>
              <p className="text-lg mb-8 text-white/90">
                Discover the finest collection of vinyl records, CDs, and cassettes. From timeless
                classics to modern hits, we have everything for true music lovers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-accent-gold text-white px-8 py-3 uppercase font-semibold tracking-wider hover:bg-accent-hover transition-colors inline-flex items-center gap-2"
                >
                  Shop Now
                  <ChevronRight size={20} />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 uppercase font-semibold tracking-wider hover:bg-white hover:text-text-primary transition-all"
                >
                  Featured Items
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRightIcon size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-accent-gold scale-125'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-neutral-card">
        <div className="container">
          <h2 className="text-3xl font-heading text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.link}
                className="bg-white p-8 text-center hover:shadow-xl transition-shadow group"
              >
                <div
                  className={`inline-flex p-6 rounded-full ${category.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  {category.icon}
                </div>
                <h3 className="text-2xl font-heading mb-2">{category.name}</h3>
                <p className="text-text-body">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-heading">Featured Products</h2>
            <Link
              href="/products?featured=true"
              className="text-accent-gold hover:text-accent-hover flex items-center gap-2 transition-colors"
            >
              View All
              <ChevronRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-card animate-pulse h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-card">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Music className="w-12 h-12 mx-auto mb-4 text-accent-gold" />
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-text-body">100% authentic products</p>
            </div>
            <div>
              <Headphones className="w-12 h-12 mx-auto mb-4 text-accent-gold" />
              <h3 className="font-semibold mb-2">Expert Curation</h3>
              <p className="text-sm text-text-body">Hand-picked by music lovers</p>
            </div>
            <div>
              <Disc className="w-12 h-12 mx-auto mb-4 text-accent-gold" />
              <h3 className="font-semibold mb-2">Rare Finds</h3>
              <p className="text-sm text-text-body">Exclusive & limited editions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-text-primary text-primary-bg">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Newsletter Form */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-heading mb-4 text-accent-gold">Stay in the Loop</h2>
              <p className="mb-6 text-primary-bg/90">
                Subscribe to get updates on new arrivals and exclusive offers
              </p>
              <form className="max-w-md mx-auto lg:mx-0 flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 bg-white text-text-body rounded"
                />
                <button
                  type="submit"
                  className="bg-accent-gold text-white px-6 py-3 uppercase font-semibold tracking-wider hover:bg-accent-hover transition-colors rounded"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Small Google Maps */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <h3 className="text-xl font-heading mb-4 text-center lg:text-left text-accent-gold">
                  Find Our Store
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.098!2d110.3657!3d-7.7956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5787bd5b6c6d%3A0x6c8b1c8b1c8b1c8b!2sMalioboro%20Street!5e0!3m2!1sen!2sid!4v1703123456789!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Hysteria Music Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
