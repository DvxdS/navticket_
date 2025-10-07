import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for scroll-triggered animations
 * Handles fade-in, slide-up, and stagger effects
 */
export const useScrollAnimations = () => {
  useEffect(() => {
    // Prevent animations on mobile if desired (optional)
    const isMobile = window.innerWidth < 768;

    // 1. Fade in from bottom (for cards, sections)
    gsap.utils.toArray('.animate-fade-up').forEach((element: any) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%', // Animation starts when element is 85% from top
            end: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 2. Stagger animation (for multiple cards in a row)
    gsap.utils.toArray('.animate-stagger-group').forEach((container: any) => {
      const children = container.querySelectorAll('.animate-stagger-item');
      
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15, // 150ms delay between each
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 3. Slide in from left
    gsap.utils.toArray('.animate-slide-left').forEach((element: any) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          x: -60,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 4. Slide in from right
    gsap.utils.toArray('.animate-slide-right').forEach((element: any) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          x: 60,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 5. Scale in (zoom effect)
    gsap.utils.toArray('.animate-scale').forEach((element: any) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 6. Background color transitions between sections
    const sections = gsap.utils.toArray('.section-with-bg');
    sections.forEach((section: any, index) => {
      const bgColor = section.getAttribute('data-bg-color') || '#FFFFFF';
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          gsap.to('body', {
            backgroundColor: bgColor,
            duration: 0.5,
            ease: 'power2.inOut',
          });
        },
        onEnterBack: () => {
          gsap.to('body', {
            backgroundColor: bgColor,
            duration: 0.5,
            ease: 'power2.inOut',
          });
        },
      });
    });

    // 7. Parallax effect for background elements
    gsap.utils.toArray('.parallax-slow').forEach((element: any) => {
      gsap.to(element, {
        y: 100,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1, // Smooth scrubbing
        },
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
};

/**
 * Hook for header background change on scroll
 */
export const useHeaderAnimation = () => {
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: {
        targets: header,
        className: 'scrolled',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
};