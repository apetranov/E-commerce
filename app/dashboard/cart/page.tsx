'use client'

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { firestore } from "@/firebase/clientApp";
import { getDocs, collection, doc, updateDoc, writeBatch, arrayRemove, arrayUnion } from 'firebase/firestore';
import StarRating from '@/components/StarRating';
import { SignedIn, useUser } from "@clerk/nextjs";
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Firestore update functions
const updateLikeStatus = async (productId: string, liked: boolean) => {
  try {
    const productRef = doc(firestore, 'product', productId);
    await updateDoc(productRef, { Liked: liked });
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

// Empty cart function
const emptyCart = async (userId: string) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { shoppingCart: [] });
    toast.success('Cart has been emptied!');
  } catch (error) {
    console.error('Error emptying cart:', error);
    toast.error('Failed to empty cart.');
  }
};

function Cart() {
  const { user } = useUser();
  const [userDoc, userLoading, userError] = useDocument(user ? doc(firestore, 'users', user.id) : null);
  const [products, productsLoading, productsError] = useCollection(collection(firestore, "product"));

  const handleLikeClick = async (productId: string, currentLikedStatus: boolean) => {
    await updateLikeStatus(productId, !currentLikedStatus);
    toast.success(currentLikedStatus ? 'Product unliked!' : 'Product liked!');
  };

  const handleCartClick = async (productId: string, currentCartStatus: boolean) => {
    if (user) {
      await updateShoppingCartStatus(user.id, productId, currentCartStatus);
      toast.success(currentCartStatus ? 'Product removed from shopping cart!' : 'Product added to shopping cart!');
    } else {
      toast.error('You need to be signed in to add items to the cart!');
    }
  };

  const userShoppingCart = userDoc?.data()?.shoppingCart || [];
  const filteredProducts = products?.docs.filter(doc => userShoppingCart.includes(doc.id)) || [];
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
            onClick={() => user && emptyCart(user.id)}
            className="text-white hover:bg-indigo-600 bg-black rounded-3xl"
          >
            Empty Cart
          </Button>
        )}
      </div>
      <div className="p-20 flex space-y-10 md:space-y-0 flex-col md:flex-row md:space-x-20">
        {filteredProducts?.map((doc) => {
          const productData = doc.data();
          const inCart = userDoc?.data()?.shoppingCart?.includes(doc.id);
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

export default Cart;
