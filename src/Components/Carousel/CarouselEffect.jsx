import React from "react";
import { Carousel } from "react-responsive-carousel";
import { img } from "./img/data";
import "react-responsive-carousel/lib/styles/carousel.min.css";

function CarouselEffect() {
  return (
    <div>
      <Carousel
        autoPlay={true}
        infiniteLoop={true}
        showIndicators={false}
        showThumbs={false}
      >
        {img.map((imageItemLink, index) => {
          return (
            <img
              key={imageItemLink}
              src={imageItemLink}
              alt={`Carousel ${index}`}
            />
          );
        })}
      </Carousel>
    </div>
  );
}

export default CarouselEffect;
