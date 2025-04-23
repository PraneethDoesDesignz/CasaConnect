import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { GooeyTextDemo } from '../components/ui/gooey-text-demo';
import { SquaresDemo } from '../components/ui/squares-demo';
import ParallaxFadeIn from '../components/ui/parallax-fadein';
import ListingItem from '../components/ListingItem';
import { auth } from '../firebase';
import 'swiper/css';
import 'swiper/css/navigation';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      auth.currentUser.getIdToken().then((idToken) => {
        // console.log('Firebase ID Token:', idToken);
      });
    }
  }, []);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOfferListings();
  }, []);
  console.log('offerListings:', offerListings);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Animated hero section */}
      <div className="w-full flex justify-center mt-2">
        <div className="max-w-6xl w-full shadow-xl shadow-black/10 rounded-lg">
          <SquaresDemo />
        </div>
      </div>

      {/* Rest of your homepage */}
      <ParallaxFadeIn>
        <div className="flex flex-col items-center justify-center w-full">
          <div>
            {/* top */}
            <div className='flex flex-col gap-6 p-10 px-3 max-w-6xl mx-auto text-center'>
              <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
                Find your next <span className='text-slate-500'>perfect</span>
                <br />
                place with ease
              </h1>
              <div className='text-gray-400 text-xs sm:text-sm'>
                CasaConnect is the best place to find your next perfect place to
                live.
                <br />
                We have a wide range of properties for you to choose from.
              </div>
              <Link
                to={'/search'}
                className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'
              >
                Let's get started...
              </Link>
            </div>

            {/* actual offerListings swiper - FIXED WIDTH AND IMAGE FIT */}
            <div className="flex justify-center w-full">
            <div className="w-[90vw] max-w-9xl mx-auto">
                <Swiper
                  modules={[Navigation]}
                  navigation
                  spaceBetween={16}
                  slidesPerView={1}
                  className="rounded-lg overflow-hidden"
                >
                  {offerListings && offerListings.length > 0 ? (
                    offerListings.map((listing) => (
                      <SwiperSlide key={listing._id}>
                        <img
                          src={listing.imageUrls?.[0] || ''}
                          alt={listing.name || 'Listing'}
                          className="w-full h-[450px] object-cover rounded-lg cursor-pointer"
                          style={{ background: '#f5f5f5' }}
                          onClick={() => navigate(`/listing/${listing._id}`)}
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div className='h-[450px] flex items-center justify-center text-gray-400 bg-gray-100'>No offers found</div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>
            </div>

            {/* listing results for offer, sale and rent */}
            <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
              {offerListings && offerListings.length > 0 && (
                <div className=''>
                  <div className='my-3'>
                    <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
                    <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>Show more offers</Link>
                  </div>
                  <div className='flex flex-wrap gap-4'>
                    {offerListings.map((listing) => (
                      <ListingItem listing={listing} key={listing._id} />
                    ))}
                  </div>
                </div>
              )}
              {rentListings && rentListings.length > 0 && (
                <div className=''>
                  <div className='my-3'>
                    <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
                    <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>Show more places for rent</Link>
                  </div>
                  <div className='flex flex-wrap gap-4'>
                    {rentListings.map((listing) => (
                      <ListingItem listing={listing} key={listing._id} />
                    ))}
                  </div>
                </div>
              )}
              {saleListings && saleListings.length > 0 && (
                <div className=''>
                  <div className='my-3'>
                    <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>
                    <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sale'}>Show more places for sale</Link>
                  </div>
                  <div className='flex flex-wrap gap-4'>
                    {saleListings.map((listing) => (
                      <ListingItem listing={listing} key={listing._id} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ParallaxFadeIn>
    </div>
  );
}
