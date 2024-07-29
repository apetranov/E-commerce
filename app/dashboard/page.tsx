'use client'

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { firestore } from "@/firebase/clientApp";
import { collection, deleteDoc, doc } from 'firebase/firestore';
import StarRating from '@/components/StarRating';
import { SignedIn } from "@clerk/nextjs";
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button";


export default function Home() {
  const [products, productsLoading, productsError] = useCollection(
    collection(firestore, "product")
);

if (!productsLoading && products) {
  products.docs.map((doc) => console.log(doc.data()));
}

  return (

   
      <div>
         < Header/>
          <div className="p-20 flex space-y-5 flex-col md:flex-row md:space-x-5">
            {products?.docs.map((doc) => {
              const productData = doc.data();
              return (
                <div key={doc.id} className="flex space-y-5 border-black flex-col justify-center items-center">
                  <h1>{productData.Name}</h1>
                  <Image
                  src={productData.Image}
                  width={300} 
                  height={300}
                  alt="Product"
                  />
                  <h3 className="text-3xl">${productData.Price}</h3>
                  <StarRating rating={Math.round(productData.CombinedReview)} />
                  <SignedIn>
                    <div className="flex flex-row space-x-5">
                    <div className={productData.Liked ? 'bg-red-600 p-2 rounded-full' : 'bg-white p-2 rounded-full'}>
                      <Heart></Heart>
                    </div>
                    <div className={productData.InShoppingCart ? 'p-2 rounded-full bg-lime-600' : 'bg-white p-2 rounded-full'}>
                      <ShoppingCart></ShoppingCart>
                    </div>
                    
                    </div>
                    
                  </SignedIn>
                </div>
              )
            
            })}
          </div>
      </div>
      
  );
}