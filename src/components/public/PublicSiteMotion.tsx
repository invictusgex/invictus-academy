"use client";

import { useEffect } from "react";

export function PublicSiteMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let context: { revert: () => void } | null = null;
    let mounted = true;

    async function initMotion() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (!mounted) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        if (document.querySelector(".cinematic-hero")) {
          gsap
            .timeline({
              defaults: {
                duration: 0.9,
                ease: "power3.out",
              },
            })
            .from(".public-hero-copy > *", {
              stagger: 0.09,
              y: 28,
            })
            .from(
              ".hero-system-map",
              {
                scale: 0.96,
                y: 24,
              },
              "-=0.55",
            )
            .from(
              ".hero-map-step",
              {
                stagger: 0.08,
                y: 18,
              },
              "-=0.45",
            );

          gsap.to(".hero-signal-sweep", {
            duration: 5.2,
            ease: "none",
            repeat: -1,
            xPercent: 135,
          });

          gsap.to(".hero-orbit", {
            duration: 28,
            ease: "none",
            repeat: -1,
            rotate: 360,
            transformOrigin: "50% 50%",
          });

          gsap.to(".hero-data-line", {
            duration: 2.6,
            ease: "sine.inOut",
            opacity: 0.82,
            repeat: -1,
            stagger: 0.22,
            yoyo: true,
          });

          gsap.to(".hero-market-bar", {
            duration: 3.4,
            ease: "sine.inOut",
            repeat: -1,
            scaleX: 1.08,
            stagger: 0.18,
            transformOrigin: "100% 50%",
            yoyo: true,
          });

          gsap.to(".hero-market-point", {
            duration: 2.2,
            ease: "sine.inOut",
            opacity: 0.46,
            repeat: -1,
            stagger: 0.16,
            y: -6,
            yoyo: true,
          });

          gsap.to(".hero-liquidity-zone", {
            duration: 4.6,
            ease: "sine.inOut",
            opacity: 0.34,
            repeat: -1,
            stagger: 0.36,
            yoyo: true,
          });

          gsap.to(".hero-orderflow-row", {
            duration: 3.1,
            ease: "sine.inOut",
            repeat: -1,
            scaleX: 0.82,
            stagger: 0.14,
            transformOrigin: "0% 50%",
            yoyo: true,
          });

          gsap.to(".hero-field", {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: 0.7,
              start: "top top",
              trigger: ".cinematic-hero",
            },
            yPercent: 14,
          });

          gsap.to(".hero-orderflow-panel", {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: 0.9,
              start: "top top",
              trigger: ".cinematic-hero",
            },
            xPercent: -9,
            yPercent: -18,
          });

          gsap.to(".hero-market-bar, .hero-market-point", {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: 0.8,
              start: "top top",
              trigger: ".cinematic-hero",
            },
            xPercent: -6,
          });

          gsap.to(".hero-reference-image-heatmap", {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: 0.75,
              start: "top top",
              trigger: ".cinematic-hero",
            },
            xPercent: -12,
            yPercent: 10,
          });

          gsap.to(".hero-reference-image-orderflow", {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: 0.9,
              start: "top top",
              trigger: ".cinematic-hero",
            },
            rotate: 0.4,
            xPercent: -7,
            yPercent: -12,
          });
        }

        const siteScrollTrigger =
          document.querySelector(".public-site main") ??
          document.querySelector(".public-site");

        if (document.querySelector(".public-scroll-field") && siteScrollTrigger) {
          gsap.to(".public-scroll-field", {
            backgroundPosition: "120px 260px, 0 180px, 160px 0",
            ease: "none",
            scrollTrigger: {
              end: "bottom bottom",
              scrub: 1.1,
              start: "top top",
              trigger: siteScrollTrigger,
            },
          });

          gsap.to(".scroll-market-layer-one", {
            ease: "none",
            scrollTrigger: {
              end: "bottom bottom",
              scrub: 1.4,
              start: "top top",
              trigger: siteScrollTrigger,
            },
            yPercent: -10,
          });

          gsap.to(".scroll-market-layer-two", {
            ease: "none",
            scrollTrigger: {
              end: "bottom bottom",
              scrub: 1.2,
              start: "top top",
              trigger: siteScrollTrigger,
            },
            xPercent: 4,
            yPercent: -16,
          });

          gsap.to(".scroll-market-layer-three", {
            ease: "none",
            scrollTrigger: {
              end: "bottom bottom",
              scrub: 1.6,
              start: "top top",
              trigger: siteScrollTrigger,
            },
            xPercent: -5,
            yPercent: -12,
          });
        }

        gsap.utils
          .toArray<HTMLElement>(".public-site main > section:not(.cinematic-hero)")
          .forEach((section) => {
            gsap.fromTo(
              section,
              {
                autoAlpha: 0.72,
                y: 42,
              },
              {
                autoAlpha: 1,
                duration: 0.85,
                ease: "power2.out",
                scrollTrigger: {
                  once: true,
                  start: "top 78%",
                  trigger: section,
                },
                y: 0,
              },
            );
          });
      });
    }

    void initMotion();

    return () => {
      mounted = false;
      context?.revert();
    };
  }, []);

  return null;
}
