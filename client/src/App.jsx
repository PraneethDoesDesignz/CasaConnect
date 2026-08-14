import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CommandPalette from './components/CommandPalette';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import Showcase from './pages/Showcase';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CommandPalette />
      <div className='flex min-h-[100dvh] flex-col'>
        <Header />
        <main id='main' className='flex-1'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/sign-in' element={<SignIn />} />
            <Route path='/sign-up' element={<SignUp />} />
            <Route path='/about' element={<About />} />
            <Route path='/search' element={<Search />} />
            <Route path='/listing/:listingId' element={<Listing />} />
            <Route path='/showcase' element={<Showcase />} />

            <Route element={<PrivateRoute />}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/create-listing' element={<CreateListing />} />
              <Route
                path='/update-listing/:listingId'
                element={<UpdateListing />}
              />
            </Route>

            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
