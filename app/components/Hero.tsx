import type { CSSProperties } from "react";
import Image from "next/image";
import hero from "@/public/hero.jpg";

const delay = (d: string) => ({ "--d": d }) as CSSProperties;

export default function Hero() {
  return (
    <header className="hero">
      <Image
        className="hero-img"
        src={hero}
        alt="An Indian man washing up at a bathroom mirror, skincare bottles on the counter"
        fill
        priority
        sizes="100vw"
        placeholder="blur"
      />
      <div className="wrap top">
        <a className="logo" href="#" aria-label="SBH home">
          SBH
        </a>
        <a className="toplink" href="#guide">
          Skin guide
        </a>
      </div>
      <div className="wrap hero-center">
        <span className="rule rise" aria-hidden="true"></span>
        <h1 className="tagline rise" style={delay(".08s")}>
          Ingredient-first skincare for men <em>who seek more.</em>
        </h1>
        <div className="launch rise" style={delay(".2s")}>
          <span className="pill">
            <i></i>Launching soon
          </span>
          <a className="jump" href="#guide">
            Ask the skin guide &darr;
          </a>
        </div>
      </div>
    </header>
  );
}
