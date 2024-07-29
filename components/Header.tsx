import React from 'react'
import { SignedIn, SignedOut} from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'
import {
    ShoppingCart,
    Heart
} from 'lucide-react'

function Header() {
  return (
    <div className="flex bg-indigo-600 px-5 flex-row justify-between items-center">
            <h1 className="text-bold p-5 rounded-lg text-white">E-COMMERCE</h1>
            <SignedOut>
                <Button className='text-indigo-600 bg-white hover:text-white'>
                    <Link href="/dashboard">Log in</Link>
                </Button>
            </SignedOut>
            <SignedIn>
                <div className='flex flex-row space-x-7'>
                <Heart className='text-white'/>
                <ShoppingCart className='text-white' />
                
                </div>  
                
            </SignedIn>
    </div>
  )
}

export default Header