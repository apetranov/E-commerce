'use client'

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { firestore } from "@/firebase/clientApp";
import { getDocs, collection, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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

// Empty cart function
const emptyCart = async () => {
    try {
        const productsRef = collection(firestore, "product");
        const querySnapshot = await getDocs(productsRef);
        const batch = writeBatch(firestore);

        querySnapshot.forEach((doc) => {
            const productRef = doc.ref;
            batch.update(productRef, { InShoppingCart: false });
        });

        await batch.commit();
        toast.success('Cart has been emptied!');
    } catch (error) {
        console.error('Error emptying cart:', error);
        toast.error('Failed to empty cart.');
    }
};

function Cart() {
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

    const filteredProducts = products?.docs.filter(doc => doc.data().InShoppingCart) || [];
    const totalPrice = filteredProducts.reduce((total, doc) => {
        const productData = doc.data();
        return total + (productData.Price || 0);
      }, 0);
  return (
    <div>
        <ToastContainer />
        <Header />
        <div className="outline outline-1 mt-5 p-5 w-2/4 h-2/4 mx-auto flex flex-col justify-center items-center">
            Total Price: ${totalPrice}
            {totalPrice > 0 && (
                <Button
                onClick={emptyCart}
                className="text-white hover:bg-indigo-600 bg-black rounded-3xl">Empty Cart</Button>
            )}
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

export default Cart