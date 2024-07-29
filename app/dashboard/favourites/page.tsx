'use client'

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { firestore } from "@/firebase/clientApp";
import { collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import StarRating from '@/components/StarRating';
import { SignedIn } from "@clerk/nextjs";
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


const updateLikeStatus = async (productId: string, liked: boolean) => {
    try {
      const productRef = doc(firestore, 'product', productId);
      await updateDoc(productRef, { Liked: liked });
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };
  
  const updateShoppingCartStatus = async (productId: string, inCart: boolean) => {
    try {
      const productRef = doc(firestore, 'product', productId);
      await updateDoc(productRef, { InShoppingCart: inCart });
    } catch (error) {
      console.error('Error updating shopping cart status:', error);
    }
  };

function Likes() {
    const handleLikeClick = async (productId: string, currentLikedStatus: boolean) => {
        await updateLikeStatus(productId, !currentLikedStatus);
        toast.success(currentLikedStatus ? 'Product unliked!' : 'Product lliked!');
      };
      
      const handleCartClick = async (productId: string, currentCartStatus: boolean) => {
        await updateShoppingCartStatus(productId, !currentCartStatus);
        toast.success(currentCartStatus ? 'Product removed from shopping cart!' : 'Product added to shopping cart!')
      };

    const [products, productsLoading, productsError] = useCollection(
        collection(firestore, "product")
    );

    const filteredProducts = products?.docs.filter(doc => doc.data().Liked) || [];
  return (
    <div>
        <ToastContainer />
        <Header />
        <div className="flex mt-10 w-2/4 md:w-1/4 mx-auto rounded-3xl p-5 bg-red-600 text-white justify-center items-center">
            <h1>Liked Products</h1>
        </div>
        
        <div className="p-20 flex space-y-10 md:space-y-0 flex-col md:flex-row md:space-x-20">
            {filteredProducts?.map((doc) => {
              const productData = doc.data();
              return (
                <div key={doc.id} className="flex space-y-5 h-2/4 p-5 outline-1 outline flex-col justify-center items-center">
                  <h1>{productData.Name}</h1>
                  <div className="w-32 h-32 md:w-64 md:h-64 overflow-hidden">
                    <Image
                      src={productData.Image}
                      width={300} 
                      height={300}
                      alt="Product"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-3xl">${productData.Price}</h3>
                  <StarRating rating={Math.round(productData.CombinedReview)} />
                  <SignedIn>
                    <div className="flex flex-row space-x-5">
                    <div
                    onClick={() => handleLikeClick(doc.id, productData.Liked)}
                    className={productData.Liked ? 'bg-red-600 p-2 rounded-full' : 'bg-white p-2 rounded-full'}>
                      <Heart></Heart>
                    </div>
                    <div
                    onClick={() => handleCartClick(doc.id, productData.InShoppingCart)}
                    className={productData.InShoppingCart ? 'p-2 rounded-full bg-lime-600' : 'bg-white p-2 rounded-full'}>
                      <ShoppingCart></ShoppingCart>
                    </div>
                    
                    </div>
                    
                  </SignedIn>
                </div>
              )
            
            })}
          </div>
    </div>
  )
}

export default Likes