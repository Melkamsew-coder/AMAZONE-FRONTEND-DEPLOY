import React from "react";
import LayOut from "../../Components/LayOut/LayOut";
import Carousel from "../../Components/Carousel/CarouselEffect";
import Product from "../../Components/Product/Product";
import Category from "../../Components/Catagory/Category";

function Landing() {
  return (
    <div>
      <LayOut>
        <Carousel />
        <Category />
        <Product />
      </LayOut>
    </div>
  );
}

export default Landing;
