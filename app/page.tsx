'use client'

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { firestore } from "@/firebase/clientApp";
import { collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import StarRating from '@/components/StarRating';
import { SignedIn, useUser } from "@clerk/nextjs";
import { Heart, ShoppingCart } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Firestore update functions
const updateLikeStatus = async (userId: string, productId: string, liked: boolean) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    if (liked) {
      await updateDoc(userRef, {
        likedProducts: arrayRemove(productId)
      });
    } else {
      await updateDoc(userRef, {
        likedProducts: arrayUnion(productId)
      });
    }
  } catch (error) {
    console.error('Error updating like status:', error);
  }
};

const updateShoppingCartStatus = async (userId: string, productId: string, inCart: boolean) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    if (inCart) {
      await updateDoc(userRef, {
        shoppingCart: arrayRemove(productId)
      });
    } else {
      await updateDoc(userRef, {
        shoppingCart: arrayUnion(productId)
      });
    }
  } catch (error) {
    console.error('Error updating shopping cart status:', error);
  }
};

export default function Home() {
  const { user } = useUser();
  const [userDoc, userLoading, userError] = useDocument(user ? doc(firestore, 'users', user.id) : null);
  const [products, productsLoading, productsError] = useCollection(collection(firestore, "product"));

  const handleLikeClick = async (productId: string, currentLikedStatus: boolean) => {
    if (user) {
      await updateLikeStatus(user.id, productId, currentLikedStatus);
      toast.success(currentLikedStatus ? 'Product unliked!' : 'Product liked!');
    } else {
      toast.error('You need to be signed in to like items!');
    }
  };

  const handleCartClick = async (productId: string, currentCartStatus: boolean) => {
    if (user) {
      await updateShoppingCartStatus(user.id, productId, currentCartStatus);
      toast.success(currentCartStatus ? 'Product removed from shopping cart!' : 'Product added to shopping cart!');
    } else {
      toast.error('You need to be signed in to add items to the cart!');
    }
  };

  if (!productsLoading && products) {
    products.docs.map((doc) => console.log(doc.data()));
  }

  return (
    <div>
      <ToastContainer />
      <Header />
      <div className="p-20 flex space-y-10 md:space-y-0 flex-col md:flex-row md:space-x-20">
        {products?.docs.map((doc) => {
          const productData = doc.data();
          const inCart = userDoc?.data()?.shoppingCart?.includes(doc.id);
          const liked = userDoc?.data()?.likedProducts?.includes(doc.id);

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
                    onClick={() => handleLikeClick(doc.id, liked)}
                    className={liked  ? 'bg-red-600 p-2 rounded-full' : 'bg-white p-2 rounded-full'}>
                    <Heart />
                  </div>
                  <div
                    onClick={() => handleCartClick(doc.id, inCart)}
                    className={inCart ? 'p-2 rounded-full bg-lime-600' : 'bg-white p-2 rounded-full'}>
                    <ShoppingCart />
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
